/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import * as FileType from 'file-type';
import { Repository } from 'typeorm';
import mediaConfiguration, { MediaConfig } from '../config/media.config';
import { ClientError, NotInDBError, PermissionError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { NotesService } from '../notes/notes.service';
import { UsersService } from '../users/users.service';
import { BackendType } from './backends/backend-type.enum';
import { FilesystemBackend } from './backends/filesystem-backend';
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
      'application/pdf',
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

  public async saveFile(fileBuffer: Buffer, username: string, noteId: string) {
    this.logger.debug(
      `Saving file for note '${noteId}' and user '${username}'`,
      'saveFile',
    );
    const note = await this.notesService.getNoteByIdOrAlias(noteId);
    const user = await this.usersService.getUserByUsername(username);
    const fileTypeResult = await FileType.fromBuffer(fileBuffer);
    if (!fileTypeResult) {
      throw new ClientError('Could not detect file type.');
    }
    if (!MediaService.isAllowedMimeType(fileTypeResult.mime)) {
      throw new ClientError('MIME type not allowed.');
    }
    const mediaUpload = MediaUpload.create(
      note,
      user,
      fileTypeResult.ext,
      this.mediaBackendType,
    );
    this.logger.debug(`Generated filename: '${mediaUpload.id}'`, 'saveFile');
    const [url, backendData] = await this.mediaBackend.saveFile(
      fileBuffer,
      mediaUpload.id,
    );
    mediaUpload.backendData = backendData;
    await this.mediaUploadRepository.save(mediaUpload);
    return url;
  }

  public async deleteFile(filename: string, username: string) {
    this.logger.debug(
      `Deleting '${filename}' for user '${username}'`,
      'deleteFile',
    );
    const mediaUpload = await this.findUploadByFilename(filename);
    if (mediaUpload.user.userName !== username) {
      this.logger.warn(
        `${username} tried to delete '${filename}', but is not the owner`,
        'deleteFile',
      );
      throw new PermissionError(
        `File '${filename}' is not owned by '${username}'`,
      );
    }
    await this.mediaBackend.deleteFile(filename, mediaUpload.backendData);
    await this.mediaUploadRepository.remove(mediaUpload);
  }

  public async findUploadByFilename(filename: string): Promise<MediaUpload> {
    const mediaUpload = await this.mediaUploadRepository.findOne(filename, {
      relations: ['user'],
    });
    if (mediaUpload === undefined) {
      throw new NotInDBError(
        `MediaUpload with filename '${filename}' not found`,
      );
    }
    return mediaUpload;
  }

  private chooseBackendType(): BackendType {
    switch (this.mediaConfig.backend.use) {
      case 'filesystem':
        return BackendType.FILESYSTEM;
    }
  }

  private getBackendFromType(type: BackendType): MediaBackend {
    switch (type) {
      case BackendType.FILESYSTEM:
        return this.moduleRef.get(FilesystemBackend);
    }
  }
}
