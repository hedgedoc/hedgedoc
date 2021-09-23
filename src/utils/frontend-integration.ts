/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NestExpressApplication } from '@nestjs/platform-express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { ConsoleLoggerService } from '../logger/console-logger.service';
import { useUnless } from './use-unless';

export function setupFrontendProxy(
  app: NestExpressApplication,
  logger: ConsoleLoggerService,
): void {
  logger.log(
    `Setting up proxy to frontend dev server on port 3001`,
    'setupFrontendProxy',
  );
  const frontendProxy = createProxyMiddleware({
    logProvider: () => {
      return {
        log: (msg) => logger.log(msg, 'FrontendProxy'),
        debug: (msg) => logger.debug(msg, 'FrontendProxy'),
        info: (msg) => logger.log(msg, 'FrontendProxy'),
        warn: (msg) => logger.warn(msg, 'FrontendProxy'),
        error: (msg) => logger.error(msg, 'FrontendProxy'),
      };
    },
    target: 'http://localhost:3001',
    changeOrigin: true,
    ws: true,
  });
  app.use(useUnless(['/api', '/public'], frontendProxy));
}
