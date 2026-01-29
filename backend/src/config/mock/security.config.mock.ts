/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigFactoryKeyHost, registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';

import { SecurityConfig } from '../security.config';

export function createDefaultMockSecurityConfig(): SecurityConfig {
  return {
    rateLimit: {
      publicApi: {
        max: 150,
        window: 300,
      },
      authenticated: {
        max: 900,
        window: 300,
      },
      unauthenticated: {
        max: 100,
        window: 300,
      },
      auth: {
        max: 20,
        window: 600,
      },
      bypass: [],
    },
  };
}

export function registerSecurityConfig(
  securityConfig: SecurityConfig,
): ConfigFactory<SecurityConfig> & ConfigFactoryKeyHost<SecurityConfig> {
  return registerAs('securityConfig', (): SecurityConfig => securityConfig);
}

export default registerSecurityConfig(createDefaultMockSecurityConfig());
