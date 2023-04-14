/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { URL } from 'url';

import mediaConfiguration, { MediaConfig } from '../../config/media.config';
import { MediaBackendError } from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { MediaBackend } from '../media-backend.interface';
import { BackendData } from '../media-upload.entity';
import { BackendType } from './backend-type.enum';

@Injectable()
export class S3Backend implements MediaBackend {
  private config: MediaConfig['backend']['s3'];
  private client: Client;

  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(mediaConfiguration.KEY)
    private mediaConfig: MediaConfig,
  ) {
    this.logger.setContext(S3Backend.name);
    if (mediaConfig.backend.use !== BackendType.S3) {
      return;
    }
    this.config = mediaConfig.backend.s3;
    const url = new URL(this.config.endPoint);
    const isSecure = url.protocol === 'https:';
    this.client = new Client({
      endPoint: url.hostname,
      port: this.determinePort(url),
      useSSL: isSecure,
      accessKey: this.config.accessKeyId,
      secretKey: this.config.secretAccessKey,
    });
  }

  private determinePort(url: URL): number | undefined {
    const port = parseInt(url.port);
    return isNaN(port) ? undefined : port;
  }

  async saveFile(
    buffer: Buffer,
    fileName: string,
  ): Promise<[string, BackendData]> {
    try {
      await this.client.putObject(this.config.bucket, fileName, buffer);
      this.logger.log(`Uploaded file ${fileName}`, 'saveFile');
      return [this.getUrl(fileName), null];
    } catch (e) {
      this.logger.error((e as Error).message, (e as Error).stack, 'saveFile');
      throw new MediaBackendError(`Could not save '${fileName}' on S3`);
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      await this.client.removeObject(this.config.bucket, fileName);
      const url = this.getUrl(fileName);
      this.logger.log(`Deleted ${url}`, 'deleteFile');
      return;
    } catch (e) {
      this.logger.error((e as Error).message, (e as Error).stack, 'saveFile');
      throw new MediaBackendError(`Could not delete '${fileName}' on S3`);
    }
  }

  private getUrl(fileName: string): string {
    const url = new URL(this.config.endPoint);
    if (!url.pathname.endsWith('/')) {
      url.pathname += '/';
    }
    url.pathname += `${this.config.bucket}/${fileName}`;
    return url.toString();
  }
}
