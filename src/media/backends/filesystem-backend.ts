/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Inject, Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

import mediaConfiguration, { MediaConfig } from '../../config/media.config';
import { MediaBackendError } from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { MediaBackend } from '../media-backend.interface';
import { BackendData } from '../media-upload.entity';

@Injectable()
export class FilesystemBackend implements MediaBackend {
  uploadDirectory = './uploads';

  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(mediaConfiguration.KEY)
    private mediaConfig: MediaConfig,
  ) {
    this.logger.setContext(FilesystemBackend.name);
    this.uploadDirectory = mediaConfig.backend.filesystem.uploadPath;
  }

  async saveFile(
    buffer: Buffer,
    fileName: string,
  ): Promise<[string, BackendData]> {
    const filePath = this.getFilePath(fileName);
    this.logger.debug(`Writing file to: ${filePath}`, 'saveFile');
    await this.ensureDirectory();
    try {
      await fs.writeFile(filePath, buffer, null);
      return ['/uploads/' + fileName, null];
    } catch (e) {
      this.logger.error((e as Error).message, (e as Error).stack, 'saveFile');
      throw new MediaBackendError(`Could not save '${filePath}'`);
    }
  }

  async deleteFile(fileName: string, _: BackendData): Promise<void> {
    const filePath = this.getFilePath(fileName);
    try {
      return await fs.unlink(filePath);
    } catch (e) {
      this.logger.error((e as Error).message, (e as Error).stack, 'deleteFile');
      throw new MediaBackendError(`Could not delete '${filePath}'`);
    }
  }

  private getFilePath(fileName: string): string {
    return join(this.uploadDirectory, fileName);
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
