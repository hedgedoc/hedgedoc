/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MediaBackendType, PermissionLevel } from '@hedgedoc/commons';
import {
  FieldNameMediaUpload,
  FieldNameMediaUploadNote,
  FieldNameNote,
  FieldNameUser,
  MediaUpload,
  Note,
  TableMediaUpload,
  TableMediaUploadNote,
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
import { PermissionService } from '../permissions/permission.service';
import {
  dateTimeToDB,
  dateTimeToISOString,
  dbToDateTime,
  getCurrentDateTime,
} from '../utils/datetime';
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

    private readonly permissionService: PermissionService,
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
   * @returns The uuid of the mediaupload
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
    this.logger.debug(`Saving file for user '${userId}'`, 'saveFile');
    const fileTypeResult = await FileType.fromBuffer(fileBuffer);
    if (!fileTypeResult) {
      throw new ClientError('Could not detect file type.');
    }
    if (!MediaService.isAllowedMimeType(fileTypeResult.mime)) {
      throw new ClientError('MIME type not allowed.');
    }
    const uuid = uuidV7();
    const backendData = await this.mediaBackend.saveFile(uuid, fileBuffer, fileTypeResult);
    await this.knex.transaction(async (transaction) => {
      await transaction(TableMediaUpload).insert({
        [FieldNameMediaUpload.uuid]: uuid,
        [FieldNameMediaUpload.fileName]: fileName,
        [FieldNameMediaUpload.userId]: userId,
        [FieldNameMediaUpload.backendType]: this.mediaBackendType,
        [FieldNameMediaUpload.backendData]: backendData,
        [FieldNameMediaUpload.createdAt]: dateTimeToDB(getCurrentDateTime()),
      });
      await transaction(TableMediaUploadNote).insert({
        [FieldNameMediaUploadNote.mediaUploadUuid]: uuid,
        [FieldNameMediaUploadNote.noteId]: noteId,
      });
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
    if (backendData === undefined) {
      throw new NotInDBError(
        `Can't find backend data for '${uuid}'`,
        this.logger.getContext(),
        'deleteFile',
      );
    }
    await this.mediaBackend.deleteFile(uuid, backendData[FieldNameMediaUpload.backendData]);
    await this.knex(TableMediaUpload).where(FieldNameMediaUpload.uuid, uuid).delete();
  }

  /**
   * Resolves a media upload into either a redirect URL (for backends that
   * expose a publicly accessible, time-limited URL like Azure, S3, imgur, or
   * WebDAV) or the file content + content type (for the local filesystem
   * backend so the controller can stream the bytes.
   *
   * @param uuid The UUID of the media upload
   * @returns A discriminated union describing how the controller should respond
   */
  async getFileResponse(uuid: string): Promise<MediaResponse> {
    if (!validateUuid(uuid)) {
      throw new NotInDBError(
        'Invalid media upload id provided',
        this.logger.getContext(),
        'getFileResponse',
      );
    }
    const mediaUpload = await this.knex(TableMediaUpload)
      .select(
        FieldNameMediaUpload.backendType,
        FieldNameMediaUpload.backendData,
        FieldNameMediaUpload.fileName,
      )
      .where(FieldNameMediaUpload.uuid, uuid)
      .first();

    if (mediaUpload === undefined) {
      throw new NotInDBError(
        `Can't find backend data for '${uuid}'`,
        this.logger.getContext(),
        'getFileResponse',
      );
    }

    const backendName = mediaUpload[FieldNameMediaUpload.backendType];
    const backendData = mediaUpload[FieldNameMediaUpload.backendData];

    const backend = this.getBackendFromType(backendName);
    if (backendName === MediaBackendType.FILESYSTEM) {
      const fileResponse = await (backend as FilesystemBackend).getFileResponse(uuid, backendData);
      return { type: 'file', ...fileResponse };
    }

    const url = await backend.getFileUrl(uuid, backendData);
    return { type: 'redirect', url };
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
      throw new NotInDBError(`MediaUpload with given uuid was not found`);
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
   * Lists all uploads linked to a specific note
   *
   * @param noteId the specific user
   * @returns An array of media uploads owned by the user
   */
  async getMediaUploadUuidsByNoteId(
    noteId: number,
  ): Promise<MediaUpload[FieldNameMediaUpload.uuid][]> {
    const results = await this.knex(TableMediaUploadNote)
      .select(FieldNameMediaUploadNote.mediaUploadUuid)
      .where(FieldNameMediaUploadNote.noteId, noteId);
    return results.map((result) => result[FieldNameMediaUploadNote.mediaUploadUuid]);
  }

  /**
   * Removes a note association from a media upload.
   *
   * @param uuid The UUID of the media upload
   * @param noteId The ID of the note to disassociate from the media upload
   */
  async removeNoteFromMediaUpload(uuid: string, noteId: number): Promise<void> {
    this.logger.debug(
      `Removing note '${noteId}' from mediaUpload: ${uuid}`,
      'removeNoteFromMediaUpload',
    );
    await this.knex(TableMediaUploadNote)
      .where(FieldNameMediaUploadNote.mediaUploadUuid, uuid)
      .andWhere(FieldNameMediaUploadNote.noteId, noteId)
      .delete();
  }

  /**
   * Adds a note association to a media upload.
   *
   * @param uuid The UUID of the media upload
   * @param noteId The ID of the note to associate with the media upload
   */
  async addNoteToMediaUpload(uuid: string, noteId: number): Promise<void> {
    await this.knex(TableMediaUploadNote)
      .insert({
        [FieldNameMediaUploadNote.mediaUploadUuid]: uuid,
        [FieldNameMediaUploadNote.noteId]: noteId,
      })
      .onConflict([FieldNameMediaUploadNote.mediaUploadUuid, FieldNameMediaUploadNote.noteId])
      .ignore();
  }

  /**
   * Checks whether a user may access a media upload.
   *
   * @param userId The id of the user to check
   * @param uuid The UUID of the media upload to check against
   * @returns true if the user has access, false otherwise
   */
  async canUserAccessUpload(userId: number, uuid: string): Promise<boolean> {
    const mediaUpload = await this.knex(TableMediaUpload)
      .select(FieldNameMediaUpload.userId)
      .where(FieldNameMediaUpload.uuid, uuid)
      .first();
    if (mediaUpload === undefined) {
      throw new NotInDBError(`MediaUpload with given uuid was not found`);
    }
    const linkedNoteIds = await this.getLinkedNoteIds(uuid);

    if (userId === null) {
      return false;
    }

    if (linkedNoteIds.length === 0) {
      return mediaUpload[FieldNameMediaUpload.userId] === userId;
    }
    for (const noteId of linkedNoteIds) {
      const linkedNotePermission = await this.permissionService.determinePermission(userId, noteId);
      if (linkedNotePermission >= PermissionLevel.READ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Retrieves a media upload DTO by UUID.
   *
   * @param uuid The UUID to fetch the media upload DTO for
   * @returns The {@link MediaUploadDto}
   */
  async getMediaUploadDtoByUuid(uuid: string): Promise<MediaUploadDto> {
    const mediaUpload = await this.knex(TableMediaUpload)
      .join(
        TableUser,
        `${TableUser}.${FieldNameUser.id}`,
        `${TableMediaUpload}.${FieldNameMediaUpload.userId}`,
      )
      .select(
        `${TableMediaUpload}.${FieldNameMediaUpload.uuid}`,
        `${TableMediaUpload}.${FieldNameMediaUpload.fileName}`,
        `${TableMediaUpload}.${FieldNameMediaUpload.createdAt}`,
        `${TableUser}.${FieldNameUser.username}`,
      )
      .where(`${TableMediaUpload}.${FieldNameMediaUpload.uuid}`, uuid)
      .first();

    if (mediaUpload === undefined) {
      throw new NotInDBError(`MediaUpload with given uuid was not found`);
    }

    return MediaUploadDto.create({
      uuid: mediaUpload[FieldNameMediaUpload.uuid],
      fileName: mediaUpload[FieldNameMediaUpload.fileName],
      linkedNoteCount: (await this.getLinkedNoteIds(uuid)).length,
      createdAt: dateTimeToISOString(dbToDateTime(mediaUpload[FieldNameMediaUpload.createdAt])),
      username: mediaUpload[FieldNameUser.username],
    });
  }

  /**
   * Retrieves media upload DTOs by a list of their UUIDs.
   *
   *
   */
  async getMediaUploadDtosByUuids(uuids: string[]): Promise<MediaUploadDto[]> {
    return await Promise.all(uuids.map(async (uuid) => await this.getMediaUploadDtoByUuid(uuid)));
  }

  /**
   * Retrieves an array of note IDs linked to the specified media upload UUID.
   */
  private async getLinkedNoteIds(uuid: string): Promise<number[]> {
    const results = await this.knex(TableMediaUploadNote)
      .select(FieldNameMediaUploadNote.noteId)
      .where(FieldNameMediaUploadNote.mediaUploadUuid, uuid);
    return results.map((result) => result[FieldNameMediaUploadNote.noteId]);
  }

  /**
   * Returns the backend type that is configured in the media configuration.
   */
  private chooseBackendType(): MediaBackendType {
    switch (this.mediaConfig.backend.type as string) {
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
        throw new Error(`Unexpected media backend ${this.mediaConfig.backend.type}`);
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
}
