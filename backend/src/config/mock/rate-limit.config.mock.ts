/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigFactoryKeyHost, registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';

import { RateLimitConfig } from '../rate-limit.config';

export function createDefaultMockRateLimitConfig(): RateLimitConfig {
  return {
    public: {
      max: 150,
      window: 300,
    },
    privateAuthenticated: {
      max: 600,
      window: 300,
    },
    privateUnauthenticated: {
      max: 100,
      window: 300,
    },
    login: {
      max: 20,
      window: 600,
    },
  };
}

export function registerRateLimitConfig(
  rateLimitConfig: RateLimitConfig,
): ConfigFactory<RateLimitConfig> & ConfigFactoryKeyHost<RateLimitConfig> {
  return registerAs('rateLimit', (): RateLimitConfig => rateLimitConfig);
}

export default registerRateLimitConfig(createDefaultMockRateLimitConfig());
