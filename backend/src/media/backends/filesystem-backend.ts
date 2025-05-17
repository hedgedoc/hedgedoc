/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Inject, Injectable } from '@nestjs/common';
import { FileTypeResult } from 'file-type';
import { promises as fs } from 'fs';
import { join } from 'path';

import mediaConfiguration, { MediaConfig } from '../../config/media.config';
import { MediaBackendError } from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { MediaBackend } from '../media-backend.interface';
import { BackendType } from './backend-type.enum';

@Injectable()
export class FilesystemBackend implements MediaBackend {
  private readonly uploadDirectory;

  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(mediaConfiguration.KEY)
    private mediaConfig: MediaConfig,
  ) {
    this.logger.setContext(FilesystemBackend.name);
    // only create the backend if local filesystem is configured
    if (this.mediaConfig.backend.use !== BackendType.FILESYSTEM) {
      this.uploadDirectory = '';
      return;
    }
    this.uploadDirectory = this.mediaConfig.backend.filesystem.uploadPath;
  }

  async saveFile(
    uuid: string,
    buffer: Buffer,
    fileType: FileTypeResult,
  ): Promise<string> {
    const filePath = this.getFilePath(uuid, fileType.ext);
    this.logger.debug(`Writing uploaded file to '${filePath}'`, 'saveFile');
    await this.ensureDirectory();
    try {
      await fs.writeFile(filePath, buffer, null);
      return JSON.stringify({ ext: fileType.ext });
    } catch (e) {
      this.logger.error((e as Error).message, (e as Error).stack, 'saveFile');
      throw new MediaBackendError(`Could not save file '${filePath}'`);
    }
  }

  async deleteFile(uuid: string, backendData: string): Promise<void> {
    if (!backendData) {
      throw new MediaBackendError('No backend data provided');
    }
    const { ext } = JSON.parse(backendData) as { ext: string };
    if (!ext) {
      throw new MediaBackendError('No file extension in backend data');
    }
    const filePath = this.getFilePath(uuid, ext);
    try {
      return await fs.unlink(filePath);
    } catch (e) {
      this.logger.error((e as Error).message, (e as Error).stack, 'deleteFile');
      throw new MediaBackendError(`Could not delete file '${filePath}'`);
    }
  }

  getFileUrl(uuid: string, backendData: string): Promise<string> {
    if (!backendData) {
      throw new MediaBackendError('No backend data provided');
    }
    const { ext } = JSON.parse(backendData) as { ext: string };
    if (!ext) {
      throw new MediaBackendError('No file extension in backend data');
    }
    return Promise.resolve(`/uploads/${uuid}.${ext}`);
  }

  private getFilePath(fileName: string, extension: string): string {
    return join(this.uploadDirectory, `${fileName}.${extension}`);
  }

  private async ensureDirectory(): Promise<void> {
    this.logger.debug(
      `Ensuring presence of directory at ${this.uploadDirectory}`,
      'ensureDirectory',
    );
    try {
      await fs.access(this.uploadDirectory);
    } catch (e) {
      try {
        this.logger.debug(
          `The directory '${this.uploadDirectory}' can't be accessed. Trying to create the directory`,
          'ensureDirectory',
        );
        await fs.mkdir(this.uploadDirectory);
      } catch (e) {
        this.logger.error(
          (e as Error).message,
          (e as Error).stack,
          'ensureDirectory',
        );
        throw new MediaBackendError(
          `Could not create '${this.uploadDirectory}'`,
        );
      }
    }
  }
}
