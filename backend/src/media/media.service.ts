/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MediaBackendType } from '@hedgedoc/commons';
import {
  Alias,
  FieldNameAlias,
  FieldNameMediaUpload,
  FieldNameNote,
  FieldNameUser,
  MediaUpload,
  Note,
  TableAlias,
  TableMediaUpload,
  TableUser,
  User,
} from '@hedgedoc/database';
import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import * as FileType from 'file-type';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { v7 as uuidV7 } from 'uuid';

import mediaConfiguration, { MediaConfig } from '../config/media.config';
import { MediaUploadDto } from '../dtos/media-upload.dto';
import { ClientError, NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { AzureBackend } from './backends/azure-backend';
import { FilesystemBackend } from './backends/filesystem-backend';
import { ImgurBackend } from './backends/imgur-backend';
import { S3Backend } from './backends/s3-backend';
import { WebdavBackend } from './backends/webdav-backend';
import { MediaBackend } from './media-backend.interface';

@Injectable()
export class MediaService {
  mediaBackend: MediaBackend;
  mediaBackendType: MediaBackendType;

  constructor(
    private readonly logger: ConsoleLoggerService,

    @InjectConnection()
    private readonly knex: Knex,

    private moduleRef: ModuleRef,

    @Inject(mediaConfiguration.KEY)
    private mediaConfig: MediaConfig,
  ) {
    this.logger.setContext(MediaService.name);
    this.mediaBackendType = this.chooseBackendType();
    this.mediaBackend = this.getBackendFromType(this.mediaBackendType);
  }

  /**
   * Checks if the given MIME type is allowed for media uploads
   *
   * @param mimeType The MIME type to check
   * @returns true if the MIME type is allowed, false otherwise
   */
  private static isAllowedMimeType(mimeType: string): boolean {
    const allowedTypes = [
      'image/apng',
      'image/bmp',
      'image/gif',
      'image/heif',
      'image/heic',
      'image/heif-sequence',
      'image/heic-sequence',
      'image/jpeg',
      'image/png',
      'image/svg+xml',
      'image/tiff',
      'image/webp',
    ];
    return allowedTypes.includes(mimeType);
  }

  /**
   * Saves the given buffer to the configured MediaBackend and creates a MediaUploadEntity
   * to track where the file is, who uploaded it and to which note
   *
   * @param fileName The original file name
   * @param fileBuffer The buffer with the file contents to save
   * @param userId Id of the user who uploaded this file
   * @param noteId Id of the note which will be associated with the new file
   * @returns The created MediaUpload entity
   * @throws ClientError if the MIME type of the file is not supported
   * @throws NotInDBError if the note or user is not in the database
   * @throws MediaBackendError if there was an error saving the file
   */
  async saveFile(
    fileName: string,
    fileBuffer: Buffer,
    userId: User[FieldNameUser.id],
    noteId: Note[FieldNameNote.id],
  ): Promise<string> {
    this.logger.debug(
      `Saving file for note '${noteId}' and user '${userId}'`,
      'saveFile',
    );
    const fileTypeResult = await FileType.fromBuffer(fileBuffer);
    if (!fileTypeResult) {
      throw new ClientError('Could not detect file type.');
    }
    if (!MediaService.isAllowedMimeType(fileTypeResult.mime)) {
      throw new ClientError('MIME type not allowed.');
    }
    const uuid = uuidV7();
    const backendData = await this.mediaBackend.saveFile(
      uuid,
      fileBuffer,
      fileTypeResult,
    );
    await this.knex(TableMediaUpload).insert({
      [FieldNameMediaUpload.uuid]: uuid,
      [FieldNameMediaUpload.fileName]: fileName,
      [FieldNameMediaUpload.userId]: userId,
      [FieldNameMediaUpload.noteId]: noteId,
      [FieldNameMediaUpload.backendType]: this.mediaBackendType,
      [FieldNameMediaUpload.backendData]: backendData,
    });
    return uuid;
  }

  /**
   * Tries to delete the specified file
   *
   * @param uuid the uuid of the file to delete
   * @throws NotInDBError if the file with the given uuid is not found in the database
   * @throws MediaBackendError if there was an error deleting the file at the backend
   */
  async deleteFile(uuid: string): Promise<void> {
    const backendData = await this.knex(TableMediaUpload)
      .select(FieldNameMediaUpload.backendData)
      .where(FieldNameMediaUpload.uuid, uuid)
      .first();
    if (backendData == undefined) {
      throw new NotInDBError(
        `Can't find backend data for '${uuid}'`,
        this.logger.getContext(),
        'deleteFile',
      );
    }
    await this.mediaBackend.deleteFile(
      uuid,
      backendData[FieldNameMediaUpload.backendData],
    );
    await this.knex(TableMediaUpload)
      .where(FieldNameMediaUpload.uuid, uuid)
      .delete();
  }

  /**
   * Retrieves the URL to a media upload file
   *
   * @param uuid the uuid of the file to get the URL for
   * @returns the URL of the file
   * @throws MediaBackendError if there was an error retrieving the url
   */
  async getFileUrl(uuid: string): Promise<string> {
    const mediaUpload = await this.knex(TableMediaUpload)
      .select(
        FieldNameMediaUpload.backendType,
        FieldNameMediaUpload.backendData,
      )
      .where(FieldNameMediaUpload.uuid, uuid)
      .first();
    if (mediaUpload === undefined) {
      throw new NotInDBError(
        `Can't find backend data for '${uuid}'`,
        this.logger.getContext(),
        'getFileUrl',
      );
    }
    const backendName = mediaUpload[FieldNameMediaUpload.backendType];
    const backend = this.getBackendFromType(backendName);
    const backendData = mediaUpload[FieldNameMediaUpload.backendData];
    return await backend.getFileUrl(uuid, backendData);
  }

  /**
   * Finds a file entry by its UUID
   *
   * @param uuid The UUID of the MediaUpload entity to find
   * @returns The MediaUpload entity if found
   * @throws NotInDBError if the MediaUpload entity with the provided UUID is not found in the database
   */
  async findUploadByUuid(uuid: string): Promise<MediaUpload> {
    const mediaUpload = await this.knex(TableMediaUpload)
      .select()
      .where(FieldNameMediaUpload.uuid, uuid)
      .first();
    if (mediaUpload === undefined) {
      throw new NotInDBError(`MediaUpload with uuid '${uuid}' not found`);
    }
    return mediaUpload;
  }

  /**
   * Lists all uploads by a specific user
   *
   * @param userId the id of the user
   * @returns An array of media uploads owned by the user
   */
  async getMediaUploadUuidsByUserId(
    userId: number,
  ): Promise<MediaUpload[FieldNameMediaUpload.uuid][]> {
    const results = await this.knex(TableMediaUpload)
      .select(FieldNameMediaUpload.uuid)
      .where(FieldNameMediaUpload.userId, userId);
    return results.map((result) => result[FieldNameMediaUpload.uuid]);
  }

  /**
   * Lists all uploads to a specific note
   *
   * @param noteId the specific user
   * @returns An array of media uploads owned by the user
   */
  async getMediaUploadUuidsByNoteId(
    noteId: number,
  ): Promise<MediaUpload[FieldNameMediaUpload.uuid][]> {
    return await this.knex.transaction(async (transaction) => {
      const results = await transaction(TableMediaUpload)
        .select(FieldNameMediaUpload.uuid)
        .where(FieldNameMediaUpload.noteId, noteId);
      return results.map((result) => result[FieldNameMediaUpload.uuid]);
    });
  }

  /**
   * Sets the note of a mediaUpload to null
   *
   * @param uuid the media upload to be changed
   */
  async removeNoteFromMediaUpload(uuid: string): Promise<void> {
    this.logger.debug(
      'Setting note to null for mediaUpload: ' + uuid,
      'removeNoteFromMediaUpload',
    );
    await this.knex(TableMediaUpload)
      .update({
        [FieldNameMediaUpload.noteId]: null,
      })
      .where(FieldNameMediaUpload.uuid, uuid);
  }

  /**
   * Returns the backend type that is configured in the media configuration
   */
  private chooseBackendType(): MediaBackendType {
    switch (this.mediaConfig.backend.use as string) {
      case 'filesystem':
        return MediaBackendType.FILESYSTEM;
      case 'azure':
        return MediaBackendType.AZURE;
      case 'imgur':
        return MediaBackendType.IMGUR;
      case 's3':
        return MediaBackendType.S3;
      case 'webdav':
        return MediaBackendType.WEBDAV;
      default:
        throw new Error(
          `Unexpected media backend ${this.mediaConfig.backend.use}`,
        );
    }
  }

  /**
   * Returns the MediaBackend instance for the given MediaBackendType
   *
   * @param type The MediaBackendType to get the backend for
   * @returns The MediaBackend instance
   */
  private getBackendFromType(type: MediaBackendType): MediaBackend {
    switch (type) {
      case MediaBackendType.FILESYSTEM:
        return this.moduleRef.get(FilesystemBackend);
      case MediaBackendType.S3:
        return this.moduleRef.get(S3Backend);
      case MediaBackendType.AZURE:
        return this.moduleRef.get(AzureBackend);
      case MediaBackendType.IMGUR:
        return this.moduleRef.get(ImgurBackend);
      case MediaBackendType.WEBDAV:
        return this.moduleRef.get(WebdavBackend);
    }
  }

  /**
   * Retrieves media upload DTOs by a list of their UUIDs
   *
   * @param uuids The UUIDs of the media uploads to retrieve
   * @returns An array of MediaUploadDto objects containing the details of the media uploads
   */
  async getMediaUploadDtosByUuids(uuids: string[]): Promise<MediaUploadDto[]> {
    const mediaUploads = await this.knex(TableMediaUpload)
      .select<
        (Pick<
          MediaUpload,
          | FieldNameMediaUpload.uuid
          | FieldNameMediaUpload.fileName
          | FieldNameMediaUpload.createdAt
        > &
          Pick<User, FieldNameUser.username> &
          Pick<Alias, FieldNameAlias.alias>)[]
      >(`${TableMediaUpload}.${FieldNameMediaUpload.uuid}`, `${TableMediaUpload}.${FieldNameMediaUpload.fileName}`, `${TableMediaUpload}.${FieldNameMediaUpload.createdAt}`, `${TableUser}.${FieldNameUser.username}`, `${TableAlias}.${FieldNameAlias.alias}`)
      .join(
        TableAlias,
        `${TableAlias}.${FieldNameAlias.noteId}`,
        `${TableMediaUpload}.${FieldNameMediaUpload.noteId}`,
      )
      .join(
        TableUser,
        `${TableUser}.${FieldNameUser.id}`,
        `${TableMediaUpload}.${FieldNameMediaUpload.userId}`,
      )
      .whereIn(FieldNameMediaUpload.uuid, uuids)
      .andWhere(FieldNameAlias.isPrimary, true);

    return mediaUploads.map((mediaUpload) =>
      MediaUploadDto.create({
        uuid: mediaUpload[FieldNameMediaUpload.uuid],
        fileName: mediaUpload[FieldNameMediaUpload.fileName],
        noteId: mediaUpload[FieldNameAlias.alias],
        createdAt: new Date(
          mediaUpload[FieldNameMediaUpload.createdAt],
        ).toISOString(),
        username: mediaUpload[FieldNameUser.username],
      }),
    );
  }
}
