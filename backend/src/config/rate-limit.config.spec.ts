/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import mockedEnv from 'mocked-env';

import rateLimitConfig from './rate-limit.config';

describe('rateLimitConfig', () => {
  const completeRateLimitConfig = {
    /* oxlint-disable @typescript-eslint/naming-convention */
    HD_SECURITY_RATE_LIMIT_PUBLIC_MAX: '150',
    HD_SECURITY_RATE_LIMIT_PUBLIC_WINDOW: '300',
    HD_SECURITY_RATE_LIMIT_PRIVATE_AUTH_MAX: '600',
    HD_SECURITY_RATE_LIMIT_PRIVATE_AUTH_WINDOW: '300',
    HD_SECURITY_RATE_LIMIT_PRIVATE_UNAUTH_MAX: '100',
    HD_SECURITY_RATE_LIMIT_PRIVATE_UNAUTH_WINDOW: '300',
    HD_SECURITY_RATE_LIMIT_LOGIN_MAX: '20',
    HD_SECURITY_RATE_LIMIT_LOGIN_WINDOW: '600',
    /* oxlint-enable @typescript-eslint/naming-convention */
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
      const config = rateLimitConfig();
      expect(config.public.max).toEqual(150);
      expect(config.public.window).toEqual(300);
      expect(config.privateAuthenticated.max).toEqual(600);
      expect(config.privateAuthenticated.window).toEqual(300);
      expect(config.privateUnauthenticated.max).toEqual(100);
      expect(config.privateUnauthenticated.window).toEqual(300);
      expect(config.login.max).toEqual(20);
      expect(config.login.window).toEqual(600);
      restore();
    });

    it('when no environment variables are set (uses defaults)', () => {
      const restore = mockedEnv(
        {},
        {
          clear: true,
        },
      );
      const config = rateLimitConfig();
      expect(config.public.max).toEqual(150);
      expect(config.public.window).toEqual(300);
      expect(config.privateAuthenticated.max).toEqual(600);
      expect(config.privateAuthenticated.window).toEqual(300);
      expect(config.privateUnauthenticated.max).toEqual(100);
      expect(config.privateUnauthenticated.window).toEqual(300);
      expect(config.login.max).toEqual(20);
      expect(config.login.window).toEqual(600);
      restore();
    });

    it('when max is set to 0 (disables rate limiting)', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_RATE_LIMIT_PUBLIC_MAX: '0',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = rateLimitConfig();
      expect(config.public.max).toEqual(0);
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
      spyConsoleError.mockRestore();
    });

    it('when max is negative', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_RATE_LIMIT_PUBLIC_MAX: '-1',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      rateLimitConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_PUBLIC_MAX: Number must be greater than or equal to 0',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when window is zero', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_RATE_LIMIT_PUBLIC_WINDOW: '0',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      rateLimitConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_PUBLIC_WINDOW: Number must be greater than 0',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when window is negative', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_RATE_LIMIT_PRIVATE_AUTH_WINDOW: '-300',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      rateLimitConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_PRIVATE_AUTHENTICATED_WINDOW: Number must be greater than 0',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when max is not an integer', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_RATE_LIMIT_LOGIN_MAX: '20.5',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      rateLimitConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_LOGIN_MAX: Expected integer',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when window is not an integer', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_RATE_LIMIT_LOGIN_WINDOW: '600.7',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      rateLimitConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_LOGIN_WINDOW: Expected integer',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });
  });
});
