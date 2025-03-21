/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MediaUploadDto } from '@hedgedoc/commons';
import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import * as FileType from 'file-type';
import { Repository } from 'typeorm';
import { v7 as uuidV7 } from 'uuid';

import mediaConfiguration, { MediaConfig } from '../config/media.config';
import { ClientError, NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';
import { AzureBackend } from './backends/azure-backend';
import { BackendType } from './backends/backend-type.enum';
import { FilesystemBackend } from './backends/filesystem-backend';
import { ImgurBackend } from './backends/imgur-backend';
import { S3Backend } from './backends/s3-backend';
import { WebdavBackend } from './backends/webdav-backend';
import { MediaBackend } from './media-backend.interface';
import { MediaUpload } from './media-upload.entity';

@Injectable()
export class MediaService {
  mediaBackend: MediaBackend;
  mediaBackendType: BackendType;

  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectRepository(MediaUpload)
    private mediaUploadRepository: Repository<MediaUpload>,
    private moduleRef: ModuleRef,
    @Inject(mediaConfiguration.KEY)
    private mediaConfig: MediaConfig,
  ) {
    this.logger.setContext(MediaService.name);
    this.mediaBackendType = this.chooseBackendType();
    this.mediaBackend = this.getBackendFromType(this.mediaBackendType);
  }

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
   * @async
   * Save the given buffer to the configured MediaBackend and create a MediaUploadEntity to track where the file is, who uploaded it and to which note.
   * @param {string} fileName - the original file name
   * @param {Buffer} fileBuffer - the buffer of the file to save.
   * @param {User} user - the user who uploaded this file
   * @param {Note} note - the note which will be associated with the new file.
   * @return {MediaUpload} the created MediaUpload entity
   * @throws {ClientError} the MIME type of the file is not supported.
   * @throws {NotInDBError} - the note or user is not in the database
   * @throws {MediaBackendError} - there was an error saving the file
   */
  async saveFile(
    fileName: string,
    fileBuffer: Buffer,
    user: User | null,
    note: Note,
  ): Promise<MediaUpload> {
    if (user) {
      this.logger.debug(
        `Saving file for note '${note.id}' and user '${user.username}'`,
        'saveFile',
      );
    } else {
      this.logger.debug(
        `Saving file for note '${note.id}' and not logged in user`,
        'saveFile',
      );
    }
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
    const mediaUpload = MediaUpload.create(
      uuid,
      fileName,
      note,
      user,
      this.mediaBackendType,
      backendData,
    );
    return await this.mediaUploadRepository.save(mediaUpload);
  }

  /**
   * @async
   * Try to delete the specified file.
   * @param {MediaUpload} mediaUpload - the name of the file to delete.
   * @throws {MediaBackendError} - there was an error deleting the file
   */
  async deleteFile(mediaUpload: MediaUpload): Promise<void> {
    await this.mediaBackend.deleteFile(
      mediaUpload.uuid,
      mediaUpload.backendData,
    );
    await this.mediaUploadRepository.remove(mediaUpload);
  }

  /**
   * @async
   * Get the URL of the file.
   * @param {MediaUpload} mediaUpload - the file to get the URL for.
   * @return {string} the URL of the file.
   * @throws {MediaBackendError} - there was an error retrieving the url
   */
  async getFileUrl(mediaUpload: MediaUpload): Promise<string> {
    const backendName = mediaUpload.backendType as BackendType;
    const backend = this.getBackendFromType(backendName);
    return await backend.getFileUrl(mediaUpload.uuid, mediaUpload.backendData);
  }

  /**
   * @async
   * Find a file entry by its filename.
   * @param {string} filename - the name of the file entry to find
   * @return {MediaUpload} the file entry, that was searched for
   * @throws {NotInDBError} - the file entry specified is not in the database
   * @throws {MediaBackendError} - there was an error retrieving the url
   */
  async findUploadByFilename(filename: string): Promise<MediaUpload> {
    const mediaUpload = await this.mediaUploadRepository.findOne({
      where: { fileName: filename },
      relations: ['user'],
    });
    if (mediaUpload === null) {
      throw new NotInDBError(
        `MediaUpload with filename '${filename}' not found`,
      );
    }
    return mediaUpload;
  }

  /**
   * @async
   * Find a file entry by its UUID.
   * @param {string} uuid - The UUID of the MediaUpload entity to find.
   * @returns {MediaUpload} - the MediaUpload entity if found.
   * @throws {NotInDBError} - the MediaUpload entity with the provided UUID is not found in the database.
   */
  async findUploadByUuid(uuid: string): Promise<MediaUpload> {
    const mediaUpload = await this.mediaUploadRepository.findOne({
      where: { uuid },
      relations: ['user'],
    });
    if (mediaUpload === null) {
      throw new NotInDBError(`MediaUpload with uuid '${uuid}' not found`);
    }
    return mediaUpload;
  }

  /**
   * @async
   * List all uploads by a specific user
   * @param {User} user - the specific user
   * @return {MediaUpload[]} arary of media uploads owned by the user
   */
  async listUploadsByUser(user: User): Promise<MediaUpload[]> {
    const mediaUploads = await this.mediaUploadRepository
      .createQueryBuilder('media')
      .where('media.userId = :userId', { userId: user.id })
      .getMany();
    if (mediaUploads === null) {
      return [];
    }
    return mediaUploads;
  }

  /**
   * @async
   * List all uploads to a specific note
   * @param {Note} note - the specific user
   * @return {MediaUpload[]} array of media uploads owned by the user
   */
  async listUploadsByNote(note: Note): Promise<MediaUpload[]> {
    const mediaUploads = await this.mediaUploadRepository
      .createQueryBuilder('upload')
      .where('upload.note = :note', { note: note.id })
      .getMany();
    if (mediaUploads === null) {
      return [];
    }
    return mediaUploads;
  }

  /**
   * @async
   * Set the note of a mediaUpload to null
   * @param {MediaUpload} mediaUpload - the media upload to be changed
   */
  async removeNoteFromMediaUpload(mediaUpload: MediaUpload): Promise<void> {
    this.logger.debug(
      'Setting note to null for mediaUpload: ' + mediaUpload.uuid,
      'removeNoteFromMediaUpload',
    );
    mediaUpload.note = Promise.resolve(null);
    await this.mediaUploadRepository.save(mediaUpload);
  }

  private chooseBackendType(): BackendType {
    switch (this.mediaConfig.backend.use as string) {
      case 'filesystem':
        return BackendType.FILESYSTEM;
      case 'azure':
        return BackendType.AZURE;
      case 'imgur':
        return BackendType.IMGUR;
      case 's3':
        return BackendType.S3;
      case 'webdav':
        return BackendType.WEBDAV;
      default:
        throw new Error(
          `Unexpected media backend ${this.mediaConfig.backend.use}`,
        );
    }
  }

  private getBackendFromType(type: BackendType): MediaBackend {
    switch (type) {
      case BackendType.FILESYSTEM:
        return this.moduleRef.get(FilesystemBackend);
      case BackendType.S3:
        return this.moduleRef.get(S3Backend);
      case BackendType.AZURE:
        return this.moduleRef.get(AzureBackend);
      case BackendType.IMGUR:
        return this.moduleRef.get(ImgurBackend);
      case BackendType.WEBDAV:
        return this.moduleRef.get(WebdavBackend);
    }
  }

  async toMediaUploadDto(mediaUpload: MediaUpload): Promise<MediaUploadDto> {
    const user = await mediaUpload.user;
    return {
      uuid: mediaUpload.uuid,
      fileName: mediaUpload.fileName,
      noteId: (await mediaUpload.note)?.publicId ?? null,
      createdAt: mediaUpload.createdAt.toISOString(),
      username: user?.username ?? null,
    };
  }
}
