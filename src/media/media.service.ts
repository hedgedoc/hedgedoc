/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import crypto from 'crypto';
import * as FileType from 'file-type';
import { Equal, Repository } from 'typeorm';

import mediaConfiguration, { MediaConfig } from '../config/media.config';
import { ClientError, NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { Note } from '../notes/note.entity';
import { NotesService } from '../notes/notes.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AzureBackend } from './backends/azure-backend';
import { BackendType } from './backends/backend-type.enum';
import { FilesystemBackend } from './backends/filesystem-backend';
import { ImgurBackend } from './backends/imgur-backend';
import { S3Backend } from './backends/s3-backend';
import { WebdavBackend } from './backends/webdav-backend';
import { MediaBackend } from './media-backend.interface';
import { MediaUploadDto } from './media-upload.dto';
import { MediaUpload } from './media-upload.entity';

@Injectable()
export class MediaService {
  mediaBackend: MediaBackend;
  mediaBackendType: BackendType;

  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectRepository(MediaUpload)
    private mediaUploadRepository: Repository<MediaUpload>,
    private notesService: NotesService,
    private usersService: UsersService,
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
   * @param {Buffer} fileBuffer - the buffer of the file to save.
   * @param {User} user - the user who uploaded this file
   * @param {Note} note - the note which will be associated with the new file.
   * @return {string} the url of the saved file
   * @throws {ClientError} the MIME type of the file is not supported.
   * @throws {NotInDBError} - the note or user is not in the database
   * @throws {MediaBackendError} - there was an error saving the file
   */
  async saveFile(
    fileBuffer: Buffer,
    user: User,
    note: Note,
  ): Promise<MediaUpload> {
    this.logger.debug(
      `Saving file for note '${note.id}' and user '${user.username}'`,
      'saveFile',
    );
    const fileTypeResult = await FileType.fromBuffer(fileBuffer);
    if (!fileTypeResult) {
      throw new ClientError('Could not detect file type.');
    }
    if (!MediaService.isAllowedMimeType(fileTypeResult.mime)) {
      throw new ClientError('MIME type not allowed.');
    }
    const randomBytes = crypto.randomBytes(16);
    const id = randomBytes.toString('hex') + '.' + fileTypeResult.ext;
    this.logger.debug(`Generated filename: '${id}'`, 'saveFile');
    const [url, backendData] = await this.mediaBackend.saveFile(fileBuffer, id);
    const mediaUpload = MediaUpload.create(
      id,
      note,
      user,
      fileTypeResult.ext,
      this.mediaBackendType,
      url,
    );
    mediaUpload.backendData = backendData;
    return await this.mediaUploadRepository.save(mediaUpload);
  }

  /**
   * @async
   * Try to delete the specified file.
   * @param {MediaUpload} mediaUpload - the name of the file to delete.
   * @throws {MediaBackendError} - there was an error deleting the file
   */
  async deleteFile(mediaUpload: MediaUpload): Promise<void> {
    await this.mediaBackend.deleteFile(mediaUpload.id, mediaUpload.backendData);
    await this.mediaUploadRepository.remove(mediaUpload);
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
      where: { id: filename },
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
   * List all uploads by a specific user
   * @param {User} user - the specific user
   * @return {MediaUpload[]} arary of media uploads owned by the user
   */
  async listUploadsByUser(user: User): Promise<MediaUpload[]> {
    const mediaUploads = await this.mediaUploadRepository.find({
      where: { user: Equal(user) },
      relations: ['user', 'note'],
    });
    if (mediaUploads === null) {
      return [];
    }
    return mediaUploads;
  }

  /**
   * @async
   * List all uploads by a specific note
   * @param {Note} note - the specific user
   * @return {MediaUpload[]} arary of media uploads owned by the user
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
      'Setting note to null for mediaUpload: ' + mediaUpload.id,
      'removeNoteFromMediaUpload',
    );
    mediaUpload.note = Promise.resolve(null);
    await this.mediaUploadRepository.save(mediaUpload);
  }

  private chooseBackendType(): BackendType {
    switch (this.mediaConfig.backend.use) {
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
    return {
      url: mediaUpload.fileUrl,
      noteId: (await mediaUpload.note)?.id ?? null,
      createdAt: mediaUpload.createdAt,
      username: (await mediaUpload.user).username,
    };
  }
}
