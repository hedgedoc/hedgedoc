/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import mockedEnv from 'mocked-env';

import appConfig from './app.config';
import { Loglevel } from './loglevel.enum';

describe('appConfig', () => {
  const domain = 'https://example.com';
  const invalidDomain = 'localhost';
  const rendererOrigin = 'https://render.example.com';
  const port = 3333;
  const negativePort = -9000;
  const floatPort = 3.14;
  const outOfRangePort = 1000000;
  const invalidPort = 'not-a-port';
  const loglevel = Loglevel.TRACE;
  const invalidLoglevel = 'not-a-loglevel';

  describe('correctly parses config', () => {
    it('when given correct and complete environment variables', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_DOMAIN: domain,
          HD_RENDERER_ORIGIN: rendererOrigin,
          PORT: port.toString(),
          HD_LOGLEVEL: loglevel,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.domain).toEqual(domain);
      expect(config.rendererOrigin).toEqual(rendererOrigin);
      expect(config.port).toEqual(port);
      expect(config.loglevel).toEqual(loglevel);
      restore();
    });

    it('when no HD_RENDER_ORIGIN is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_DOMAIN: domain,
          PORT: port.toString(),
          HD_LOGLEVEL: loglevel,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.domain).toEqual(domain);
      expect(config.rendererOrigin).toEqual(domain);
      expect(config.port).toEqual(port);
      expect(config.loglevel).toEqual(loglevel);
      restore();
    });

    it('when no PORT is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_DOMAIN: domain,
          HD_RENDERER_ORIGIN: rendererOrigin,
          HD_LOGLEVEL: loglevel,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.domain).toEqual(domain);
      expect(config.rendererOrigin).toEqual(rendererOrigin);
      expect(config.port).toEqual(3000);
      expect(config.loglevel).toEqual(loglevel);
      restore();
    });

    it('when no HD_LOGLEVEL is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_DOMAIN: domain,
          HD_RENDERER_ORIGIN: rendererOrigin,
          PORT: port.toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = appConfig();
      expect(config.domain).toEqual(domain);
      expect(config.rendererOrigin).toEqual(rendererOrigin);
      expect(config.port).toEqual(port);
      expect(config.loglevel).toEqual(Loglevel.WARN);
      restore();
    });
  });
  describe('throws error', () => {
    it('when given a non-valid HD_DOMAIN', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_DOMAIN: invalidDomain,
          PORT: port.toString(),
          HD_LOGLEVEL: loglevel,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => appConfig()).toThrow('HD_DOMAIN');
      restore();
    });

    it('when given a negative PORT', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_DOMAIN: domain,
          PORT: negativePort.toString(),
          HD_LOGLEVEL: loglevel,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => appConfig()).toThrow('"PORT" must be a positive number');
      restore();
    });

    it('when given a out-of-range PORT', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_DOMAIN: domain,
          PORT: outOfRangePort.toString(),
          HD_LOGLEVEL: loglevel,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => appConfig()).toThrow(
        '"PORT" must be less than or equal to 65535',
      );
      restore();
    });

    it('when given a non-integer PORT', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_DOMAIN: domain,
          PORT: floatPort.toString(),
          HD_LOGLEVEL: loglevel,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => appConfig()).toThrow('"PORT" must be an integer');
      restore();
    });

    it('when given a non-number PORT', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_DOMAIN: domain,
          PORT: invalidPort,
          HD_LOGLEVEL: loglevel,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => appConfig()).toThrow('"PORT" must be a number');
      restore();
    });

    it('when given a non-loglevel HD_LOGLEVEL', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_DOMAIN: domain,
          PORT: port.toString(),
          HD_LOGLEVEL: invalidLoglevel,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => appConfig()).toThrow('HD_LOGLEVEL');
      restore();
    });
  });
});
