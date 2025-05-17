/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Inject, Injectable } from '@nestjs/common';
import fetch, { Response } from 'node-fetch';
import { URLSearchParams } from 'url';

import mediaConfiguration, {
  ImgurMediaConfig,
  MediaConfig,
} from '../../config/media.config';
import { MediaBackendError } from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { MediaBackend } from '../media-backend.interface';
import { BackendType } from './backend-type.enum';

type UploadResult = {
  data: {
    link: string;
    deletehash: string | null;
  };
};

interface ImgurBackendData {
  url: string;
  deleteHash: string | null;
}

@Injectable()
export class ImgurBackend implements MediaBackend {
  private config: ImgurMediaConfig['imgur'];

  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(mediaConfiguration.KEY)
    private mediaConfig: MediaConfig,
  ) {
    this.logger.setContext(ImgurBackend.name);
    // only create the backend if imgur is configured
    if (this.mediaConfig.backend.use !== BackendType.IMGUR) {
      return;
    }
    this.config = this.mediaConfig.backend.imgur;
  }

  async saveFile(uuid: string, buffer: Buffer): Promise<string> {
    const params = new URLSearchParams();
    params.append('image', buffer.toString('base64'));
    params.append('type', 'base64');
    try {
      const result = (await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        body: params,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: { Authorization: `Client-ID ${this.config.clientId}` },
      })
        .then((res) => ImgurBackend.checkStatus(res))
        .then((res) => res.json())) as UploadResult;
      this.logger.debug(`Response: ${JSON.stringify(result)}`, 'saveFile');
      this.logger.log(`Uploaded file ${uuid}`, 'saveFile');
      const backendData: ImgurBackendData = {
        url: result.data.link,
        deleteHash: result.data.deletehash,
      };
      return JSON.stringify(backendData);
    } catch (e) {
      this.logger.error(
        `error: ${(e as Error).message}`,
        (e as Error).stack,
        'saveFile',
      );
      throw new MediaBackendError(`Could not save file ${uuid}`);
    }
  }

  async deleteFile(uuid: string, jsonBackendData: string): Promise<void> {
    const backendData = JSON.parse(jsonBackendData) as ImgurBackendData;
    if (backendData.deleteHash === null) {
      throw new MediaBackendError(
        `We don't have any delete tokens for file ${uuid} and therefore can't delete this image`,
      );
    }
    try {
      const result = await fetch(
        `https://api.imgur.com/3/image/${backendData.deleteHash}`,
        {
          method: 'DELETE',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          headers: { Authorization: `Client-ID ${this.config.clientId}` },
        },
      );
      ImgurBackend.checkStatus(result);
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      this.logger.log(`Deleted file ${uuid}`, 'deleteFile');
      return;
    } catch (e) {
      this.logger.error(
        `error: ${(e as Error).message}`,
        (e as Error).stack,
        'deleteFile',
      );
      throw new MediaBackendError(`Could not delete file '${uuid}'`);
    }
  }

  getFileUrl(uuid: string, backendData: string | null): Promise<string> {
    if (backendData === null) {
      throw new MediaBackendError(
        `We don't have any data for file ${uuid} and therefore can't get the url of this image`,
      );
    }
    const data = JSON.parse(backendData) as ImgurBackendData;
    return Promise.resolve(data.url);
  }

  private static checkStatus(res: Response): Response {
    if (res.ok) {
      // res.status >= 200 && res.status < 300
      return res;
    } else {
      throw new MediaBackendError(res.statusText);
    }
  }
}
