/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  BlobSASPermissions,
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { Inject, Injectable } from '@nestjs/common';
import { FileTypeResult } from 'file-type';

import mediaConfiguration, {
  AzureMediaConfig,
  MediaConfig,
} from '../../config/media.config';
import { MediaBackendError } from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { MediaBackend } from '../media-backend.interface';
import { BackendType } from './backend-type.enum';

@Injectable()
export class AzureBackend implements MediaBackend {
  private config: AzureMediaConfig['azure'];
  private client: ContainerClient;
  private readonly credential: StorageSharedKeyCredential;

  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(mediaConfiguration.KEY)
    private mediaConfig: MediaConfig,
  ) {
    this.logger.setContext(AzureBackend.name);
    // only create the backend if azure is configured
    if (this.mediaConfig.backend.use !== BackendType.AZURE) {
      return;
    }
    this.config = this.mediaConfig.backend.azure;
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      this.config.connectionString,
    );
    this.credential =
      blobServiceClient.credential as StorageSharedKeyCredential;
    this.client = blobServiceClient.getContainerClient(this.config.container);
  }

  async saveFile(
    uuid: string,
    buffer: Buffer,
    fileType: FileTypeResult,
  ): Promise<null> {
    const blockBlobClient: BlockBlobClient =
      this.client.getBlockBlobClient(uuid);
    try {
      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: {
          blobContentType: fileType.mime,
        },
      });
      this.logger.log(`Uploaded file ${uuid}`, 'saveFile');
      return null;
    } catch (e) {
      this.logger.error(
        `error: ${(e as Error).message}`,
        (e as Error).stack,
        'saveFile',
      );
      throw new MediaBackendError(`Could not save file '${uuid}'`);
    }
  }

  async deleteFile(uuid: string, _: unknown): Promise<void> {
    const blockBlobClient: BlockBlobClient =
      this.client.getBlockBlobClient(uuid);
    try {
      const response = await blockBlobClient.delete();
      if (response.errorCode !== undefined) {
        throw new MediaBackendError(
          `Could not delete '${uuid}': ${response.errorCode}`,
        );
      }
      this.logger.log(`Deleted file ${uuid}`, 'deleteFile');
    } catch (e) {
      this.logger.error(
        `error: ${(e as Error).message}`,
        (e as Error).stack,
        'deleteFile',
      );
      throw new MediaBackendError(`Could not delete file ${uuid}`);
    }
  }

  getFileUrl(uuid: string, _: unknown): Promise<string> {
    const blockBlobClient: BlockBlobClient =
      this.client.getBlockBlobClient(uuid);
    const blobSAS = generateBlobSASQueryParameters(
      {
        containerName: this.config.container,
        blobName: uuid,
        permissions: BlobSASPermissions.parse('r'),
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
      },
      this.credential,
    );
    return Promise.resolve(`${blockBlobClient.url}?${blobSAS.toString()}`);
  }
}
