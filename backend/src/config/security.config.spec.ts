/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import mockedEnv from 'mocked-env';

import securityConfig from './security.config';

describe('securityConfig: rate limiting', () => {
  const completeRateLimitConfig = {
    HD_SECURITY_RATE_LIMIT_PUBLIC_API_MAX: '150',
    HD_SECURITY_RATE_LIMIT_PUBLIC_API_WINDOW: '300',
    HD_SECURITY_RATE_LIMIT_AUTHENTICATED_MAX: '600',
    HD_SECURITY_RATE_LIMIT_AUTHENTICATED_WINDOW: '300',
    HD_SECURITY_RATE_LIMIT_UNAUTHENTICATED_MAX: '100',
    HD_SECURITY_RATE_LIMIT_UNAUTHENTICATED_WINDOW: '300',
    HD_SECURITY_RATE_LIMIT_AUTH_MAX: '40',
    HD_SECURITY_RATE_LIMIT_AUTH_WINDOW: '900',
    HD_SECURITY_RATE_LIMIT_BYPASS: '127.0.0.1,::1',
  };

  describe('is correctly parsed', () => {
    it('when given correct and complete environment variables', () => {
      const restore = mockedEnv(
        {
          ...completeRateLimitConfig,
        },
        {
          clear: true,
        },
      );
      const config = securityConfig();
      expect(config.rateLimit.publicApi.max).toEqual(150);
      expect(config.rateLimit.publicApi.window).toEqual(300);
      expect(config.rateLimit.authenticated.max).toEqual(600);
      expect(config.rateLimit.authenticated.window).toEqual(300);
      expect(config.rateLimit.unauthenticated.max).toEqual(100);
      expect(config.rateLimit.unauthenticated.window).toEqual(300);
      expect(config.rateLimit.auth.max).toEqual(40);
      expect(config.rateLimit.auth.window).toEqual(900);
      expect(config.rateLimit.bypass).toEqual(['127.0.0.1', '::1']);
      restore();
    });

    it('when no environment variables are set (uses defaults)', () => {
      const restore = mockedEnv(
        {},
        {
          clear: true,
        },
      );
      const config = securityConfig();
      expect(config.rateLimit.publicApi.max).toEqual(150);
      expect(config.rateLimit.publicApi.window).toEqual(300);
      expect(config.rateLimit.authenticated.max).toEqual(900);
      expect(config.rateLimit.authenticated.window).toEqual(300);
      expect(config.rateLimit.unauthenticated.max).toEqual(100);
      expect(config.rateLimit.unauthenticated.window).toEqual(300);
      expect(config.rateLimit.auth.max).toEqual(40);
      expect(config.rateLimit.auth.window).toEqual(900);
      expect(config.rateLimit.bypass).toEqual([]);
      restore();
    });

    it('when max is set to 0 (disables rate limiting)', () => {
      const restore = mockedEnv(
        {
          HD_SECURITY_RATE_LIMIT_PUBLIC_API_MAX: '0',
        },
        {
          clear: true,
        },
      );
      const config = securityConfig();
      expect(config.rateLimit.publicApi.max).toEqual(0);
      restore();
    });

    it('when bypass is set with a single IPv4 address', () => {
      const restore = mockedEnv(
        {
          HD_SECURITY_RATE_LIMIT_BYPASS: '192.168.1.1',
        },
        {
          clear: true,
        },
      );
      const config = securityConfig();
      expect(config.rateLimit.bypass).toEqual(['192.168.1.1']);
      restore();
    });

    it('when bypass is set with multiple IP addresses', () => {
      const restore = mockedEnv(
        {
          HD_SECURITY_RATE_LIMIT_BYPASS: '127.0.0.1,::1,192.168.1.1',
        },
        {
          clear: true,
        },
      );
      const config = securityConfig();
      expect(config.rateLimit.bypass).toEqual(['127.0.0.1', '::1', '192.168.1.1']);
      restore();
    });

    it('when bypass is set with IPv6 addresses', () => {
      const restore = mockedEnv(
        {
          HD_SECURITY_RATE_LIMIT_BYPASS: '::1,fe80::1',
        },
        {
          clear: true,
        },
      );
      const config = securityConfig();
      expect(config.rateLimit.bypass).toEqual(['::1', 'fe80::1']);
      restore();
    });
  });

  describe('throws error', () => {
    let spyConsoleError: jest.Spied<typeof console.error>;
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
      spyConsoleError.mockRestore();
    });

    it('when max is negative', () => {
      const restore = mockedEnv(
        {
          HD_SECURITY_RATE_LIMIT_PUBLIC_API_MAX: '-1',
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_PUBLIC_API_MAX: Too small: expected number to be >=0',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when window is zero', () => {
      const restore = mockedEnv(
        {
          HD_SECURITY_RATE_LIMIT_PUBLIC_API_WINDOW: '0',
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_PUBLIC_API_WINDOW: Too small: expected number to be >0',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when window is negative', () => {
      const restore = mockedEnv(
        {
          HD_SECURITY_RATE_LIMIT_AUTHENTICATED_WINDOW: '-300',
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_AUTHENTICATED_WINDOW: Too small: expected number to be >0',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when max is not an integer', () => {
      const restore = mockedEnv(
        {
          HD_SECURITY_RATE_LIMIT_AUTH_MAX: '20.5',
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_AUTH_MAX: Invalid input: expected int, received number',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when window is not an integer', () => {
      const restore = mockedEnv(
        {
          HD_SECURITY_RATE_LIMIT_AUTH_WINDOW: '600.7',
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_AUTH_WINDOW: Invalid input: expected int, received number',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when bypass contains an invalid IP address', () => {
      const restore = mockedEnv(
        {
          HD_SECURITY_RATE_LIMIT_BYPASS: '127.0.0.1,invalid-ip',
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_BYPASS[1]: Invalid input',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when bypass contains a malformed IPv4 address', () => {
      const restore = mockedEnv(
        {
          HD_SECURITY_RATE_LIMIT_BYPASS: '999.999.999.999',
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_BYPASS[0]: Invalid input',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });
  });
});
