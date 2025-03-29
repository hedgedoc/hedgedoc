/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import mockedEnv from 'mocked-env';

import appConfig from './app.config';
import { Loglevel } from './loglevel.enum';

describe('appConfig', () => {
  const baseUrl = 'https://example.com/';
  const invalidBaseUrl = 'localhost';
  const rendererBaseUrl = 'https://render.example.com/';
  const port = 3333;
  const negativePort = -9000;
  const floatPort = 3.14;
  const outOfRangePort = 1000000;
  const invalidPort = 'not-a-port';
  const loglevel = Loglevel.TRACE;
  const showLogTimestamp = false;
  const invalidLoglevel = 'not-a-loglevel';
  const invalidPersistInterval = -1;

  describe('correctly parses config', () => {
    it('when given correct and complete environment variables', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_RENDERER_BASE_URL: rendererBaseUrl,
          HD_BACKEND_PORT: port.toString(),
          HD_LOGLEVEL: loglevel,
          HD_SHOW_LOG_TIMESTAMP: showLogTimestamp.toString(),
          HD_PERSIST_INTERVAL: '100',
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.baseUrl).toEqual(baseUrl);
      expect(config.rendererBaseUrl).toEqual(rendererBaseUrl);
      expect(config.backendPort).toEqual(port);
      expect(config.loglevel).toEqual(loglevel);
      expect(config.showLogTimestamp).toEqual(showLogTimestamp);
      expect(config.persistInterval).toEqual(100);
      restore();
    });

    it('when no HD_RENDER_ORIGIN is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_BACKEND_PORT: port.toString(),
          HD_LOGLEVEL: loglevel,
          HD_SHOW_LOG_TIMESTAMP: showLogTimestamp.toString(),
          HD_PERSIST_INTERVAL: '100',
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.baseUrl).toEqual(baseUrl);
      expect(config.rendererBaseUrl).toEqual(baseUrl);
      expect(config.backendPort).toEqual(port);
      expect(config.loglevel).toEqual(loglevel);
      expect(config.showLogTimestamp).toEqual(showLogTimestamp);
      expect(config.persistInterval).toEqual(100);
      restore();
    });

    it('when no PORT is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_RENDERER_BASE_URL: rendererBaseUrl,
          HD_LOGLEVEL: loglevel,
          HD_SHOW_LOG_TIMESTAMP: showLogTimestamp.toString(),
          HD_PERSIST_INTERVAL: '100',
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.baseUrl).toEqual(baseUrl);
      expect(config.rendererBaseUrl).toEqual(rendererBaseUrl);
      expect(config.backendPort).toEqual(3000);
      expect(config.loglevel).toEqual(loglevel);
      expect(config.showLogTimestamp).toEqual(showLogTimestamp);
      expect(config.persistInterval).toEqual(100);
      restore();
    });

    it('when no HD_LOGLEVEL is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_RENDERER_BASE_URL: rendererBaseUrl,
          HD_BACKEND_PORT: port.toString(),
          HD_SHOW_LOG_TIMESTAMP: showLogTimestamp.toString(),
          HD_PERSIST_INTERVAL: '100',
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.baseUrl).toEqual(baseUrl);
      expect(config.rendererBaseUrl).toEqual(rendererBaseUrl);
      expect(config.backendPort).toEqual(port);
      expect(config.loglevel).toEqual(Loglevel.WARN);
      expect(config.showLogTimestamp).toEqual(showLogTimestamp);
      expect(config.persistInterval).toEqual(100);
      restore();
    });

    it('when no HD_PERSIST_INTERVAL is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_RENDERER_BASE_URL: rendererBaseUrl,
          HD_LOGLEVEL: loglevel,
          HD_SHOW_LOG_TIMESTAMP: showLogTimestamp.toString(),
          HD_BACKEND_PORT: port.toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.baseUrl).toEqual(baseUrl);
      expect(config.rendererBaseUrl).toEqual(rendererBaseUrl);
      expect(config.backendPort).toEqual(port);
      expect(config.loglevel).toEqual(Loglevel.TRACE);
      expect(config.showLogTimestamp).toEqual(showLogTimestamp);
      expect(config.persistInterval).toEqual(10);
      restore();
    });

    it('when HD_PERSIST_INTERVAL is zero', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_RENDERER_BASE_URL: rendererBaseUrl,
          HD_LOGLEVEL: loglevel,
          HD_SHOW_LOG_TIMESTAMP: showLogTimestamp.toString(),
          HD_BACKEND_PORT: port.toString(),
          HD_PERSIST_INTERVAL: '0',
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.baseUrl).toEqual(baseUrl);
      expect(config.rendererBaseUrl).toEqual(rendererBaseUrl);
      expect(config.backendPort).toEqual(port);
      expect(config.loglevel).toEqual(Loglevel.TRACE);
      expect(config.showLogTimestamp).toEqual(showLogTimestamp);
      expect(config.persistInterval).toEqual(0);
      restore();
    });
    it('when no HD_SHOW_LOG_TIMESTAMP is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_RENDERER_BASE_URL: rendererBaseUrl,
          HD_LOGLEVEL: loglevel,
          HD_BACKEND_PORT: port.toString(),
          HD_PERSIST_INTERVAL: '0',
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.baseUrl).toEqual(baseUrl);
      expect(config.rendererBaseUrl).toEqual(rendererBaseUrl);
      expect(config.backendPort).toEqual(port);
      expect(config.loglevel).toEqual(Loglevel.TRACE);
      expect(config.showLogTimestamp).toEqual(true);
      expect(config.persistInterval).toEqual(0);
      restore();
    });
  });
  describe('throws error', () => {
    it('when given a non-valid HD_BASE_URL', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: invalidBaseUrl,
          HD_BACKEND_PORT: port.toString(),
          HD_LOGLEVEL: loglevel,
          HD_SHOW_LOG_TIMESTAMP: showLogTimestamp.toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => appConfig()).toThrow('HD_BASE_URL');
      restore();
    });

    it('when given a base url with subdirectory in HD_BASE_URL', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: 'https://example.org/subdirectory/',
          HD_LOGLEVEL: loglevel,
          HD_SHOW_LOG_TIMESTAMP: showLogTimestamp.toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => appConfig()).toThrow(
        'HD_BASE_URL: baseUrl must not contain a subdirectory',
      );
      restore();
    });

    it('when given a negative PORT', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_BACKEND_PORT: negativePort.toString(),
          HD_LOGLEVEL: loglevel,
          HD_SHOW_LOG_TIMESTAMP: showLogTimestamp.toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => appConfig()).toThrow(
        'HD_BACKEND_PORT: Number must be greater than 0',
      );
      restore();
    });

    it('when given a out-of-range PORT', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_BACKEND_PORT: outOfRangePort.toString(),
          HD_LOGLEVEL: loglevel,
          HD_SHOW_LOG_TIMESTAMP: showLogTimestamp.toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => appConfig()).toThrow(
        'HD_BACKEND_PORT: Number must be less than or equal to 65535',
      );
      restore();
    });

    it('when given a non-integer PORT', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_BACKEND_PORT: floatPort.toString(),
          HD_LOGLEVEL: loglevel,
          HD_SHOW_LOG_TIMESTAMP: showLogTimestamp.toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => appConfig()).toThrow(
        'HD_BACKEND_PORT: Expected integer, received float',
      );
      restore();
    });

    it('when given a non-number PORT', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_BACKEND_PORT: invalidPort,
          HD_LOGLEVEL: loglevel,
          HD_SHOW_LOG_TIMESTAMP: showLogTimestamp.toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => appConfig()).toThrow(
        'HD_BACKEND_PORT: Expected number, received nan',
      );
      restore();
    });

    it('when given a non-loglevel HD_LOGLEVEL', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_BACKEND_PORT: port.toString(),
          HD_LOGLEVEL: invalidLoglevel,
          HD_SHOW_LOG_TIMESTAMP: showLogTimestamp.toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => appConfig()).toThrow('HD_LOGLEVEL');
      restore();
    });

    it('when given a negative HD_PERSIST_INTERVAL', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_BACKEND_PORT: port.toString(),
          HD_LOGLEVEL: invalidLoglevel,
          HD_SHOW_LOG_TIMESTAMP: showLogTimestamp.toString(),
          HD_PERSIST_INTERVAL: invalidPersistInterval.toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => appConfig()).toThrow('HD_PERSIST_INTERVAL');
      restore();
    });
  });
});
