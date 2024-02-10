/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Inject, Injectable } from '@nestjs/common';
import { URL } from 'url';

import mediaConfiguration, { MediaConfig } from '../../config/media.config';
import { MediaBackendError } from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { MediaBackend } from '../media-backend.interface';
import { BackendData } from '../media-upload.entity';
import { BackendType } from './backend-type.enum';

@Injectable()
export class WebdavBackend implements MediaBackend {
  private config: MediaConfig['backend']['webdav'];
  private authHeader: string;
  private baseUrl: string;

  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(mediaConfiguration.KEY)
    private mediaConfig: MediaConfig,
  ) {
    this.logger.setContext(WebdavBackend.name);
    if (mediaConfig.backend.use === BackendType.WEBDAV) {
      this.config = mediaConfig.backend.webdav;
      const url = new URL(this.config.connectionString);
      const port = url.port !== '' ? `:${url.port}` : '';
      this.baseUrl = `${url.protocol}//${url.hostname}${port}${url.pathname}`;
      if (this.config.uploadDir && this.config.uploadDir !== '') {
        this.baseUrl = WebdavBackend.joinURL(
          this.baseUrl,
          this.config.uploadDir,
        );
      }
      this.authHeader = WebdavBackend.generateBasicAuthHeader(
        url.username,
        url.password,
      );
      fetch(this.baseUrl, {
        method: 'PROPFIND',
        headers: {
          Accept: 'text/plain', // eslint-disable-line @typescript-eslint/naming-convention
          Authorization: this.authHeader, // eslint-disable-line @typescript-eslint/naming-convention
          Depth: '0', // eslint-disable-line @typescript-eslint/naming-convention
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Can't access ${this.baseUrl}`);
          }
        })
        .catch(() => {
          throw new Error(`Can't access ${this.baseUrl}`);
        });
    }
  }

  async saveFile(
    buffer: Buffer,
    fileName: string,
  ): Promise<[string, BackendData]> {
    try {
      const contentLength = buffer.length;
      await fetch(WebdavBackend.joinURL(this.baseUrl, '/', fileName), {
        method: 'PUT',
        body: buffer,
        headers: {
          Authorization: this.authHeader, // eslint-disable-line @typescript-eslint/naming-convention
          'Content-Type': 'application/octet-stream', // eslint-disable-line @typescript-eslint/naming-convention
          'Content-Length': `${contentLength}`, // eslint-disable-line @typescript-eslint/naming-convention
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'If-None-Match': '*', // Don't overwrite already existing files
        },
      }).then((res) => WebdavBackend.checkStatus(res));
      this.logger.log(`Uploaded file ${fileName}`, 'saveFile');
      return [this.getUrl(fileName), null];
    } catch (e) {
      this.logger.error((e as Error).message, (e as Error).stack, 'saveFile');
      throw new MediaBackendError(`Could not save '${fileName}' on WebDav`);
    }
  }

  async deleteFile(fileName: string, _: BackendData): Promise<void> {
    try {
      await fetch(WebdavBackend.joinURL(this.baseUrl, '/', fileName), {
        method: 'DELETE',
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: this.authHeader,
        },
      }).then((res) => WebdavBackend.checkStatus(res));
      const url = this.getUrl(fileName);
      this.logger.log(`Deleted ${url}`, 'deleteFile');
      return;
    } catch (e) {
      this.logger.error((e as Error).message, (e as Error).stack, 'saveFile');
      throw new MediaBackendError(`Could not delete '${fileName}' on WebDav`);
    }
  }

  private getUrl(fileName: string): string {
    return WebdavBackend.joinURL(this.config.publicUrl, '/', fileName);
  }

  private static generateBasicAuthHeader(
    username: string,
    password: string,
  ): string {
    const encoded = Buffer.from(`${username}:${password}`).toString('base64');
    return `Basic ${encoded}`;
  }

  private static joinURL(...urlParts: Array<string>): string {
    return urlParts.reduce((output, next, index) => {
      if (
        index === 0 ||
        next !== '/' ||
        (next === '/' && output[output.length - 1] !== '/')
      ) {
        output += next;
      }
      return output;
    }, '');
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
