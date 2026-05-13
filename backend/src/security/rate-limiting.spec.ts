/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from '@jest/globals';
import type { errorResponseBuilderContext } from '@fastify/rate-limit';
import { Mock } from 'ts-mockery';

import type { FastifyRequest } from 'fastify';
import type { CompleteRequest } from '../api/utils/request.type';
import type { SecurityConfig } from '../config/security.config';
import {
  buildRateLimitResponse,
  generateRateLimitKey,
  getMaxLimitByRequestWithSecurityConfig,
  getTimeWindowByRequestWithSecurityConfig,
} from './rate-limiting';
import type { SessionState } from '../sessions/session-state';

describe('rate limiting', () => {
  const securityConfig = Mock.of<SecurityConfig>({
    rateLimit: {
      publicApi: { max: 150, window: 300 },
      authenticated: { max: 600, window: 300 },
      unauthenticated: { max: 100, window: 300 },
      auth: { max: 40, window: 900 },
    },
  });

  function createMockedRequest(options: {
    url: string;
    routeUrl?: string;
    ip?: string;
    userId?: number | null;
  }): FastifyRequest {
    return Mock.of<CompleteRequest>({
      url: options.url,
      ip: options.ip ?? '203.0.113.10',
      routeOptions: options.routeUrl ? { url: options.routeUrl } : undefined,
      session: Mock.of<SessionState>({
        userId: options.userId ?? null,
      }),
    }) as FastifyRequest;
  }

  it('generates a user based key for authenticated requests', () => {
    const request = createMockedRequest({ url: '/api/v2/notes', userId: 42 });
    expect(generateRateLimitKey(request)).toBe('user:42');
  });

  it('falls back to the ip based key for unauthenticated requests', () => {
    const request = createMockedRequest({ url: '/api/v2/notes', ip: '198.51.100.5' });
    expect(generateRateLimitKey(request)).toBe('ip:198.51.100.5');
  });

  it('uses the routeUrl if provided (test with authenticated v2 request)', () => {
    const request = createMockedRequest({ url: '/ignored', routeUrl: '/api/v2/notes', userId: 7 });
    expect(getTimeWindowByRequestWithSecurityConfig(securityConfig)(request, 'key')).toBe(300000);
    expect(getMaxLimitByRequestWithSecurityConfig(securityConfig)(request, 'key')).toBe(150);
  });

  it('uses the public api limits for authenticated v2 requests', () => {
    const request = createMockedRequest({ url: '/api/v2/notes', userId: 7 });
    expect(getTimeWindowByRequestWithSecurityConfig(securityConfig)(request, 'key')).toBe(300000);
    expect(getMaxLimitByRequestWithSecurityConfig(securityConfig)(request, 'key')).toBe(150);
  });

  it('uses the unauthenticated limits for unauthenticated v2 requests', () => {
    const request = createMockedRequest({ url: '/api/v2/notes' });
    expect(getTimeWindowByRequestWithSecurityConfig(securityConfig)(request, 'key')).toBe(300000);
    expect(getMaxLimitByRequestWithSecurityConfig(securityConfig)(request, 'key')).toBe(100);
  });

  it('uses the authenticated private api limits for authenticated requests', () => {
    const request = createMockedRequest({ url: '/api/private/notes', userId: 7 });
    expect(getTimeWindowByRequestWithSecurityConfig(securityConfig)(request, 'key')).toBe(300000);
    expect(getMaxLimitByRequestWithSecurityConfig(securityConfig)(request, 'key')).toBe(600);
  });

  it('never rate limits logout requests', () => {
    const request = createMockedRequest({ url: '/api/private/auth/logout', userId: 7 });
    expect(getTimeWindowByRequestWithSecurityConfig(securityConfig)(request, 'key')).toBe(0);
    expect(getMaxLimitByRequestWithSecurityConfig(securityConfig)(request, 'key')).toBe(Infinity);
  });

  it('never rate limits monitoring requests', () => {
    const request = createMockedRequest({
      url: '/api/private/monitoring/prometheus',
      ip: '192.0.2.4',
    });
    expect(getTimeWindowByRequestWithSecurityConfig(securityConfig)(request, 'key')).toBe(0);
    expect(getMaxLimitByRequestWithSecurityConfig(securityConfig)(request, 'key')).toBe(Infinity);
  });

  it('uses auth limits for auth endpoints', () => {
    const request = createMockedRequest({ url: '/api/private/auth/login' });
    expect(getTimeWindowByRequestWithSecurityConfig(securityConfig)(request, 'key')).toBe(900000);
    expect(getMaxLimitByRequestWithSecurityConfig(securityConfig)(request, 'key')).toBe(40);
  });

  it('returns infinity when the configured max is zero', () => {
    const request = createMockedRequest({ url: '/api/private/auth/login' });
    const config = Mock.of<SecurityConfig>({
      rateLimit: {
        publicApi: { max: 150, window: 300 },
        authenticated: { max: 600, window: 300 },
        unauthenticated: { max: 100, window: 300 },
        auth: { max: 0, window: 600 },
      },
    });

    expect(getMaxLimitByRequestWithSecurityConfig(config)(request, 'key')).toBe(Infinity);
  });

  it('builds the expected rate limit response', () => {
    const context = Mock.of<errorResponseBuilderContext>({
      after: '10 seconds',
      ttl: 2500,
    });

    expect(buildRateLimitResponse(Mock.of<FastifyRequest>({}), context)).toEqual({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later (10 seconds).',
      expiresIn: 2500,
    });
  });
});
