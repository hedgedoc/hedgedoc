/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Inject, Injectable } from '@nestjs/common';
import { FileTypeResult } from 'file-type';
import fetch, { Response } from 'node-fetch';
import { URL } from 'url';

import mediaConfiguration, {
  MediaConfig,
  WebdavMediaConfig,
} from '../../config/media.config';
import { MediaBackendError } from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { MediaBackend } from '../media-backend.interface';
import { BackendType } from './backend-type.enum';

@Injectable()
export class WebdavBackend implements MediaBackend {
  private config: WebdavMediaConfig['webdav'];
  private authHeader: string;
  private readonly baseUrl: string;

  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(mediaConfiguration.KEY)
    private mediaConfig: MediaConfig,
  ) {
    this.logger.setContext(WebdavBackend.name);
    // only create the backend if WebDAV is configured
    if (this.mediaConfig.backend.use !== BackendType.WEBDAV) {
      return;
    }

    this.config = this.mediaConfig.backend.webdav;
    const url = new URL(this.config.connectionString);
    this.baseUrl = url.toString();
    if (this.config.uploadDir && this.config.uploadDir !== '') {
      this.baseUrl = WebdavBackend.joinURL(this.baseUrl, this.config.uploadDir);
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

  async saveFile(
    uuid: string,
    buffer: Buffer,
    fileType: FileTypeResult,
  ): Promise<string> {
    try {
      const contentLength = buffer.length;
      const remoteFileName = `${uuid}.${fileType.ext}`;
      await fetch(WebdavBackend.joinURL(this.baseUrl, '/', remoteFileName), {
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
      this.logger.log(`Uploaded file ${uuid}`, 'saveFile');
      return JSON.stringify({ file: remoteFileName });
    } catch (e) {
      this.logger.error((e as Error).message, (e as Error).stack, 'saveFile');
      throw new MediaBackendError(`Could not save upload '${uuid}'`);
    }
  }

  async deleteFile(uuid: string, backendData: string): Promise<void> {
    if (!backendData) {
      throw new MediaBackendError('No backend data provided');
    }
    try {
      const { file } = JSON.parse(backendData) as { file: string };
      if (!file) {
        throw new MediaBackendError('No file name in backend data');
      }
      await fetch(WebdavBackend.joinURL(this.baseUrl, '/', file), {
        method: 'DELETE',
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: this.authHeader,
        },
      }).then((res) => WebdavBackend.checkStatus(res));
      this.logger.log(`Deleted upload ${uuid}`, 'deleteFile');
      return;
    } catch (e) {
      this.logger.error((e as Error).message, (e as Error).stack, 'deleteFile');
      throw new MediaBackendError(`Could not delete upload '${uuid}'`);
    }
  }

  getFileUrl(_: string, backendData: string): Promise<string> {
    if (!backendData) {
      throw new MediaBackendError('No backend data provided');
    }
    const { file } = JSON.parse(backendData) as { file: string };
    if (!file) {
      throw new MediaBackendError('No file name in backend data');
    }
    return Promise.resolve(
      WebdavBackend.joinURL(this.config.publicUrl, '/', file),
    );
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
