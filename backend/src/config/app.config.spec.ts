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
  const bindIp = '0.0.0.0';
  const bindIpV6 = '::1';
  const invalidBindIp = 'not-an-ip';
  const loglevel = Loglevel.TRACE;
  const showLogTimestamp = false;
  const invalidLoglevel = 'not-a-loglevel';

  describe('correctly parses config', () => {
    it('when given correct and complete environment variables', async () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_RENDERER_BASE_URL: rendererBaseUrl,
          HD_BACKEND_PORT: port.toString(),
          HD_BACKEND_BIND_IP: bindIp,
          HD_LOG_LEVEL: loglevel,
          HD_LOG_SHOW_TIMESTAMP: showLogTimestamp.toString(),
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.baseUrl).toEqual(baseUrl);
      expect(config.rendererBaseUrl).toEqual(rendererBaseUrl);
      expect(config.backendPort).toEqual(port);
      expect(config.backendBindIp).toEqual(bindIp);
      expect(config.log.level).toEqual(loglevel);
      expect(config.log.showTimestamp).toEqual(showLogTimestamp);
      restore();
    });

    it('when given an IPv6 address as HD_BACKEND_BIND_IP', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_BACKEND_BIND_IP: bindIpV6,
          HD_LOG_LEVEL: loglevel,
          HD_LOG_SHOW_TIMESTAMP: showLogTimestamp.toString(),
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.backendBindIp).toEqual(bindIpV6);
      restore();
    });

    it('when no HD_BACKEND_BIND_IP is set', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_LOG_LEVEL: loglevel,
          HD_LOG_SHOW_TIMESTAMP: showLogTimestamp.toString(),
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.backendBindIp).toEqual('127.0.0.1');
      restore();
    });

    it('when no HD_RENDER_BASE_URL is set', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_BACKEND_PORT: port.toString(),
          HD_LOG_LEVEL: loglevel,
          HD_LOG_SHOW_TIMESTAMP: showLogTimestamp.toString(),
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.baseUrl).toEqual(baseUrl);
      expect(config.rendererBaseUrl).toEqual(baseUrl);
      expect(config.backendPort).toEqual(port);
      expect(config.log.level).toEqual(loglevel);
      expect(config.log.showTimestamp).toEqual(showLogTimestamp);
      restore();
    });

    it('when no PORT is set', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_RENDERER_BASE_URL: rendererBaseUrl,
          HD_LOG_LEVEL: loglevel,
          HD_LOG_SHOW_TIMESTAMP: showLogTimestamp.toString(),
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.baseUrl).toEqual(baseUrl);
      expect(config.rendererBaseUrl).toEqual(rendererBaseUrl);
      expect(config.backendPort).toEqual(3000);
      expect(config.log.level).toEqual(loglevel);
      expect(config.log.showTimestamp).toEqual(showLogTimestamp);
      restore();
    });

    it('when no HD_LOG_LEVEL is set', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_RENDERER_BASE_URL: rendererBaseUrl,
          HD_BACKEND_PORT: port.toString(),
          HD_LOG_SHOW_TIMESTAMP: showLogTimestamp.toString(),
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.baseUrl).toEqual(baseUrl);
      expect(config.rendererBaseUrl).toEqual(rendererBaseUrl);
      expect(config.backendPort).toEqual(port);
      expect(config.log.level).toEqual(Loglevel.INFO);
      expect(config.log.showTimestamp).toEqual(showLogTimestamp);
      restore();
    });

    it('when no HD_LOG_SHOW_TIMESTAMP is set', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_RENDERER_BASE_URL: rendererBaseUrl,
          HD_LOG_LEVEL: loglevel,
          HD_BACKEND_PORT: port.toString(),
          HD_PERSIST_INTERVAL: '0',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.baseUrl).toEqual(baseUrl);
      expect(config.rendererBaseUrl).toEqual(rendererBaseUrl);
      expect(config.backendPort).toEqual(port);
      expect(config.log.level).toEqual(Loglevel.TRACE);
      expect(config.log.showTimestamp).toEqual(true);
      restore();
    });
  });

  describe('throws error', () => {
    let spyConsoleError: jest.SpyInstance;
    let spyProcessExit: jest.Mock;
    let originalProcess: typeof process;

    beforeEach(() => {
      spyConsoleError = jest.spyOn(console, 'error');
      spyProcessExit = jest.fn();
      originalProcess = global.process;
      global.process = {
        ...originalProcess,
        exit: spyProcessExit,
      } as unknown as typeof global.process;
    });

    afterEach(() => {
      global.process = originalProcess;
      jest.restoreAllMocks();
    });

    it('when given a non-valid HD_BASE_URL', async () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: invalidBaseUrl,
          HD_BACKEND_PORT: port.toString(),
          HD_LOG_LEVEL: loglevel,
          HD_LOG_SHOW_TIMESTAMP: showLogTimestamp.toString(),
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      appConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain("HD_BASE_URL: Can't parse as URL");
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when given a base url with subdirectory in HD_BASE_URL', async () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: 'https://example.org/subdirectory/',
          HD_LOG_LEVEL: loglevel,
          HD_LOG_SHOW_TIMESTAMP: showLogTimestamp.toString(),
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      appConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_BASE_URL: baseUrl must not contain a subdirectory',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when given a negative PORT', async () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_BACKEND_PORT: negativePort.toString(),
          HD_LOG_LEVEL: loglevel,
          HD_LOG_SHOW_TIMESTAMP: showLogTimestamp.toString(),
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      appConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_BACKEND_PORT: Number must be greater than 0',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when given a out-of-range PORT', async () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_BACKEND_PORT: outOfRangePort.toString(),
          HD_LOG_LEVEL: loglevel,
          HD_LOG_SHOW_TIMESTAMP: showLogTimestamp.toString(),
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      appConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_BACKEND_PORT: Number must be less than or equal to 65535',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when given a non-integer PORT', async () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_BACKEND_PORT: floatPort.toString(),
          HD_LOG_LEVEL: loglevel,
          HD_LOG_SHOW_TIMESTAMP: showLogTimestamp.toString(),
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      appConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_BACKEND_PORT: Expected integer, received float',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when given a non-number PORT', async () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_BACKEND_PORT: invalidPort,
          HD_LOG_LEVEL: loglevel,
          HD_LOG_SHOW_TIMESTAMP: showLogTimestamp.toString(),
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      appConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_BACKEND_PORT: Expected number, received nan',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when given a non-IP address as HD_BACKEND_BIND_IP', async () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_BACKEND_BIND_IP: invalidBindIp,
          HD_LOG_LEVEL: loglevel,
          HD_LOG_SHOW_TIMESTAMP: showLogTimestamp.toString(),
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      appConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain('HD_BACKEND_BIND_IP');
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when given a non-loglevel HD_LOG_LEVEL', async () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_BASE_URL: baseUrl,
          HD_BACKEND_PORT: port.toString(),
          HD_LOG_LEVEL: invalidLoglevel,
          HD_LOG_SHOW_TIMESTAMP: showLogTimestamp.toString(),
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      appConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain('HD_LOG_LEVEL');
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });
  });
});
