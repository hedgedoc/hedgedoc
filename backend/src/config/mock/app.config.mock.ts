/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigFactoryKeyHost, registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';

import { AppConfig } from '../app.config';
import { Loglevel } from '../loglevel.enum';

export function createDefaultMockAppConfig(): AppConfig {
  return {
    baseUrl: 'md.example.com',
    rendererBaseUrl: 'md-renderer.example.com',
    backendPort: 3000,
    log: {
      level: Loglevel.INFO,
      showTimestamp: true,
    },
  };
}

export function registerAppConfig(
  appConfig: AppConfig,
): ConfigFactory<AppConfig> & ConfigFactoryKeyHost<AppConfig> {
  return registerAs('appConfig', (): AppConfig => appConfig);
}

export default registerAppConfig(createDefaultMockAppConfig());
