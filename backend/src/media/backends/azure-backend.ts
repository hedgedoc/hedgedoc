/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient,
} from '@azure/storage-blob';
import { Inject, Injectable } from '@nestjs/common';

import mediaConfiguration, { MediaConfig } from '../../config/media.config';
import { MediaBackendError } from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { MediaBackend } from '../media-backend.interface';
import { BackendData } from '../media-upload.entity';
import { BackendType } from './backend-type.enum';

@Injectable()
export class AzureBackend implements MediaBackend {
  private config: MediaConfig['backend']['azure'];
  private client: ContainerClient;

  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(mediaConfiguration.KEY)
    private mediaConfig: MediaConfig,
  ) {
    this.logger.setContext(AzureBackend.name);
    this.config = mediaConfig.backend.azure;
    if (mediaConfig.backend.use === BackendType.AZURE) {
      // only create the client if the backend is configured to azure
      const blobServiceClient = BlobServiceClient.fromConnectionString(
        this.config.connectionString,
      );
      this.client = blobServiceClient.getContainerClient(this.config.container);
    }
  }

  async saveFile(
    buffer: Buffer,
    fileName: string,
  ): Promise<[string, BackendData]> {
    const blockBlobClient: BlockBlobClient =
      this.client.getBlockBlobClient(fileName);
    try {
      await blockBlobClient.upload(buffer, buffer.length);
      const url = this.getUrl(fileName);
      this.logger.log(`Uploaded ${url}`, 'saveFile');
      return [url, null];
    } catch (e) {
      this.logger.error(
        `error: ${(e as Error).message}`,
        (e as Error).stack,
        'saveFile',
      );
      throw new MediaBackendError(`Could not save '${fileName}' on Azure`);
    }
  }

  async deleteFile(fileName: string, _: BackendData): Promise<void> {
    const blockBlobClient: BlockBlobClient =
      this.client.getBlockBlobClient(fileName);
    try {
      await blockBlobClient.delete();
      const url = this.getUrl(fileName);
      this.logger.log(`Deleted ${url}`, 'deleteFile');
      return;
    } catch (e) {
      this.logger.error(
        `error: ${(e as Error).message}`,
        (e as Error).stack,
        'deleteFile',
      );
      throw new MediaBackendError(`Could not delete '${fileName}' on Azure`);
    }
  }

  private getUrl(fileName: string): string {
    return `${this.client.url}/${fileName}`;
  }
}
