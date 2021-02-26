/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import mediaConfiguration from '../../config/media.config';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { MediaBackend } from '../media-backend.interface';
import { BackendData } from '../media-upload.entity';
import { MediaConfig } from '../../config/media.config';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { MediaBackendError } from '../../errors/errors';

@Injectable()
export class ImgurBackend implements MediaBackend {
  private config: MediaConfig['backend']['imgur'];

  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(mediaConfiguration.KEY)
    private mediaConfig: MediaConfig,
  ) {
    this.logger.setContext(ImgurBackend.name);
    this.config = mediaConfig.backend.imgur;
  }

  async saveFile(
    buffer: Buffer,
    fileName: string,
  ): Promise<[string, BackendData]> {
    const params = new URLSearchParams();
    params.append('image', buffer.toString('base64'));
    params.append('type', 'base64');
    try {
      const result = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        body: params,
        headers: { Authorization: `Client-ID ${this.config.clientID}` },
      })
        .then(ImgurBackend.checkStatus)
        .then((res) => res.json());
      this.logger.debug(`Response: ${JSON.stringify(result)}`, 'saveFile');
      this.logger.log(`Uploaded ${fileName}`, 'saveFile');
      return [result.data.link, result.data.deletehash];
    } catch (e) {
      this.logger.error(`error: ${e.message}`, e.stack, 'saveFile');
      throw new MediaBackendError(`Could not save '${fileName}' on imgur`);
    }
  }

  async deleteFile(fileName: string, backendData: BackendData): Promise<void> {
    if (backendData === null) {
      throw new Error();
    }
    try {
      const result = await fetch(
        `https://api.imgur.com/3/image/${backendData}`,
        {
          method: 'POST',
          headers: { Authorization: `Client-ID ${this.config.clientID}` },
        },
      ).then(ImgurBackend.checkStatus);
      this.logger.debug(`Response: ${result}`, 'saveFile');
      this.logger.log(`Deleted ${fileName}`, 'deleteFile');
      return;
    } catch (e) {
      this.logger.error(`error: ${e.message}`, e.stack, 'deleteFile');
      throw new MediaBackendError(`Could not delete '${fileName}' on imgur`);
    }
  }

  private static checkStatus(res) {
    if (res.ok) {
      // res.status >= 200 && res.status < 300
      return res;
    } else {
      throw new MediaBackendError(res.statusText);
    }
  }
}
