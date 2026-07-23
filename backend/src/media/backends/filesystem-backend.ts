/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MediaBackendType } from '@hedgedoc/commons';
import { Inject, Injectable } from '@nestjs/common';
import { FileTypeResult } from 'file-type';
import { promises as fs } from 'fs';
import { join } from 'path';

import mediaConfiguration, { MediaConfig } from '../../config/media.config';
import { MediaBackendError } from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { MediaBackend } from '../media-backend.interface';
import { MediaFileResponse } from '../media-response.interface';

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
    if (this.mediaConfig.backend.type !== MediaBackendType.FILESYSTEM) {
      this.uploadDirectory = '';
      return;
    }
    this.uploadDirectory = this.mediaConfig.backend.filesystem.uploadPath;
    this.logger.debug(`Activated media backend filesystem using ${this.uploadDirectory}`);
  }

  async saveFile(uuid: string, buffer: Buffer, fileType: FileTypeResult): Promise<string> {
    const filePath = this.getFilePath(uuid, fileType.ext);
    this.logger.debug(`Writing uploaded file to '${filePath}'`, 'saveFile');
    await this.ensureDirectory();
    try {
      await fs.writeFile(filePath, buffer, null);
      return JSON.stringify({ ext: fileType.ext, mime: fileType.mime });
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

  getFileUrl(uuid: string, _: string): Promise<string> {
    return Promise.resolve(`/media/${uuid}`);
  }

  /**
   * Reads the file from the local filesystem and returns its content together
   * with the detected MIME type..
   *
   * @param uuid Unique identifier of the uploaded file
   * @param backendData Internal backend data
   * @returns Object containing the file buffer and the detected MIME type
   */
  async getFileResponse(
    uuid: string,
    backendData: string | null,
  ): Promise<Omit<MediaFileResponse, 'type'>> {
    if (!backendData) {
      throw new MediaBackendError('No backend data provided');
    }
    const { ext, mime } = JSON.parse(backendData) as { ext: string; mime: string };
    if (!ext) {
      throw new MediaBackendError('No file extension in backend data');
    }
    const filePath = this.getFilePath(uuid, ext);
    const buffer = await fs.readFile(filePath);
    const contentType = mime ?? 'application/octet-stream';
    return { buffer, contentType, fileName: `${uuid}.${ext}` };
  }

  private getFilePath(fileName: string, extension: string): string {
    if (!/^[a-zA-Z0-9]+$/.test(extension)) {
      throw new MediaBackendError(`Invalid file extension: ${extension}`);
    }
    return join(this.uploadDirectory, `${fileName}.${extension}`);
  }

  private async ensureDirectory(): Promise<void> {
    this.logger.debug(
      `Ensuring presence of directory at ${this.uploadDirectory}`,
      'ensureDirectory',
    );
    try {
      await fs.access(this.uploadDirectory);
    } catch {
      try {
        this.logger.debug(
          `The directory '${this.uploadDirectory}' can't be accessed. Trying to create the directory`,
          'ensureDirectory',
        );
        await fs.mkdir(this.uploadDirectory);
      } catch (e) {
        this.logger.error((e as Error).message, (e as Error).stack, 'ensureDirectory');
        throw new MediaBackendError(`Could not create '${this.uploadDirectory}'`);
      }
    }
  }
}
