/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import mockedEnv from 'mocked-env';

import securityConfig from './security.config';

describe('securityConfig: rate limiting', () => {
  const completeRateLimitConfig = {
    /* oxlint-disable @typescript-eslint/naming-convention */
    HD_SECURITY_RATE_LIMIT_PUBLIC_API_MAX: '150',
    HD_SECURITY_RATE_LIMIT_PUBLIC_API_WINDOW: '300',
    HD_SECURITY_RATE_LIMIT_AUTHENTICATED_MAX: '600',
    HD_SECURITY_RATE_LIMIT_AUTHENTICATED_WINDOW: '300',
    HD_SECURITY_RATE_LIMIT_UNAUTHENTICATED_MAX: '100',
    HD_SECURITY_RATE_LIMIT_UNAUTHENTICATED_WINDOW: '300',
    HD_SECURITY_RATE_LIMIT_AUTH_MAX: '20',
    HD_SECURITY_RATE_LIMIT_AUTH_WINDOW: '600',
    HD_SECURITY_RATE_LIMIT_BYPASS: '127.0.0.1,::1',
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
      const config = securityConfig();
      expect(config.rateLimit.publicApi.max).toEqual(150);
      expect(config.rateLimit.publicApi.window).toEqual(300);
      expect(config.rateLimit.authenticated.max).toEqual(600);
      expect(config.rateLimit.authenticated.window).toEqual(300);
      expect(config.rateLimit.unauthenticated.max).toEqual(100);
      expect(config.rateLimit.unauthenticated.window).toEqual(300);
      expect(config.rateLimit.auth.max).toEqual(20);
      expect(config.rateLimit.auth.window).toEqual(600);
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
      expect(config.rateLimit.auth.max).toEqual(20);
      expect(config.rateLimit.auth.window).toEqual(600);
      expect(config.rateLimit.bypass).toEqual([]);
      restore();
    });

    it('when max is set to 0 (disables rate limiting)', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_RATE_LIMIT_PUBLIC_API_MAX: '0',
          /* oxlint-enable @typescript-eslint/naming-convention */
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
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_RATE_LIMIT_BYPASS: '192.168.1.1',
          /* oxlint-enable @typescript-eslint/naming-convention */
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
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_RATE_LIMIT_BYPASS: '127.0.0.1,::1,192.168.1.1',
          /* oxlint-enable @typescript-eslint/naming-convention */
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
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_RATE_LIMIT_BYPASS: '::1,fe80::1',
          /* oxlint-enable @typescript-eslint/naming-convention */
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
          HD_SECURITY_RATE_LIMIT_PUBLIC_API_MAX: '-1',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_PUBLIC_API_MAX: Number must be greater than or equal to 0',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when window is zero', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_RATE_LIMIT_PUBLIC_API_WINDOW: '0',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_PUBLIC_API_WINDOW: Number must be greater than 0',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when window is negative', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_RATE_LIMIT_AUTHENTICATED_WINDOW: '-300',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_AUTHENTICATED_WINDOW: Number must be greater than 0',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when max is not an integer', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_RATE_LIMIT_AUTH_MAX: '20.5',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_AUTH_MAX: Expected integer',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when window is not an integer', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_RATE_LIMIT_AUTH_WINDOW: '600.7',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_AUTH_WINDOW: Expected integer',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when bypass contains an invalid IP address', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_RATE_LIMIT_BYPASS: '127.0.0.1,invalid-ip',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_BYPASS[1]: Invalid ip',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when bypass contains a malformed IPv4 address', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_RATE_LIMIT_BYPASS: '999.999.999.999',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_RATE_LIMIT_BYPASS[0]: Invalid ip',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when CSP additional script source is not a valid URL', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_CSP_ADDITIONAL_SCRIPT_SRC: 'not-a-url',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_SECURITY_CSP_ADDITIONAL_SCRIPT_SRC[0]',
      );
      expect(spyConsoleError.mock.calls[0][0]).toContain('Invalid url');
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when CSP additional image source is missing protocol', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_CSP_ADDITIONAL_IMG_SRC: 'example.com',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain('HD_SECURITY_CSP_ADDITIONAL_IMG_SRC[0]');
      expect(spyConsoleError.mock.calls[0][0]).toContain('Invalid url');
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when CSP additional frame source uses ftp protocol', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_CSP_ADDITIONAL_FRAME_SRC: 'ftp://example.com',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain('HD_SECURITY_CSP_ADDITIONAL_FRAME_SRC[0]');
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'Must be a valid URL with http:// or https:// protocol',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when CSP multiple additional sources are invalid', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_CSP_ADDITIONAL_IMG_SRC: 'ftp://example.com,not-a-url',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain('HD_SECURITY_CSP_ADDITIONAL_IMG_SRC');
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when CSP additional source has valid URL format but wrong protocol', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_CSP_ADDITIONAL_STYLE_SRC: 'file:///etc/passwd',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      securityConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain('HD_SECURITY_CSP_ADDITIONAL_STYLE_SRC[0]');
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'Must be a valid URL with http:// or https:// protocol',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });
  });
});

describe('securityConfig: CSP', () => {
  const completeCSPConfig = {
    /* oxlint-disable @typescript-eslint/naming-convention */
    HD_SECURITY_CSP_ENABLE: 'true',
    HD_SECURITY_CSP_REPORT_ONLY: 'false',
    HD_SECURITY_CSP_REPORT_URI: '/api/v2/security/csp-report',
    HD_SECURITY_CSP_ADDITIONAL_SCRIPT_SRC: 'https://cdn.example.com',
    HD_SECURITY_CSP_ADDITIONAL_STYLE_SRC: 'https://fonts.googleapis.com',
    HD_SECURITY_CSP_ADDITIONAL_IMG_SRC: 'https://images.example.com,https://cdn.example.com',
    HD_SECURITY_CSP_ADDITIONAL_FRAME_SRC: 'https://embed.example.com',
    HD_SECURITY_CSP_ADDITIONAL_CONNECT_SRC: 'https://api.example.com,wss://ws.example.com',
    /* oxlint-enable @typescript-eslint/naming-convention */
  };

  describe('is correctly parsed', () => {
    it('when given correct and complete environment variables', () => {
      const restore = mockedEnv(
        {
          ...completeCSPConfig,
        },
        {
          clear: true,
        },
      );
      const config = securityConfig();
      expect(config.csp.enable).toEqual(true);
      expect(config.csp.reportOnly).toEqual(false);
      expect(config.csp.reportUri).toEqual('/api/v2/security/csp-report');
      expect(config.csp.additionalScriptSrc).toEqual(['https://cdn.example.com']);
      expect(config.csp.additionalStyleSrc).toEqual(['https://fonts.googleapis.com']);
      expect(config.csp.additionalImgSrc).toEqual([
        'https://images.example.com',
        'https://cdn.example.com',
      ]);
      expect(config.csp.additionalFrameSrc).toEqual(['https://embed.example.com']);
      expect(config.csp.additionalConnectSrc).toEqual([
        'https://api.example.com',
        'wss://ws.example.com',
      ]);
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
      expect(config.csp.enable).toEqual(true);
      expect(config.csp.reportOnly).toEqual(false);
      expect(config.csp.reportUri).toBeUndefined();
      expect(config.csp.additionalScriptSrc).toEqual([]);
      expect(config.csp.additionalStyleSrc).toEqual([]);
      expect(config.csp.additionalImgSrc).toEqual([]);
      expect(config.csp.additionalFrameSrc).toEqual([]);
      expect(config.csp.additionalConnectSrc).toEqual([]);
      restore();
    });

    it('when CSP is disabled', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_CSP_ENABLE: 'false',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = securityConfig();
      expect(config.csp.enable).toEqual(false);
      restore();
    });

    it('when CSP is in report-only mode', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_CSP_REPORT_ONLY: 'true',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = securityConfig();
      expect(config.csp.reportOnly).toEqual(true);
      restore();
    });

    it('when additional sources contain single values', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_CSP_ADDITIONAL_SCRIPT_SRC: 'https://single.example.com',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = securityConfig();
      expect(config.csp.additionalScriptSrc).toEqual(['https://single.example.com']);
      restore();
    });

    it('when additional sources contain multiple comma-separated values', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_CSP_ADDITIONAL_FRAME_SRC:
            'https://youtube.com,https://vimeo.com,https://player.example.com',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = securityConfig();
      expect(config.csp.additionalFrameSrc).toEqual([
        'https://youtube.com',
        'https://vimeo.com',
        'https://player.example.com',
      ]);
      restore();
    });

    it('when report URI is set', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_CSP_REPORT_URI: 'https://csp-report.example.com/report',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = securityConfig();
      expect(config.csp.reportUri).toEqual('https://csp-report.example.com/report');
      restore();
    });

    it('when additional script source is valid with https protocol', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_CSP_ADDITIONAL_SCRIPT_SRC: 'https://scripts.example.com',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = securityConfig();
      expect(config.csp.additionalScriptSrc).toEqual(['https://scripts.example.com']);
      restore();
    });

    it('when additional image source is valid with http protocol', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_CSP_ADDITIONAL_IMG_SRC: 'http://images.example.com',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = securityConfig();
      expect(config.csp.additionalImgSrc).toEqual(['http://images.example.com']);
      restore();
    });

    it('when additional connect source contains websocket URLs', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_CSP_ADDITIONAL_CONNECT_SRC: 'wss://ws.example.com,ws://localhost:3000',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = securityConfig();
      expect(config.csp.additionalConnectSrc).toEqual([
        'wss://ws.example.com',
        'ws://localhost:3000',
      ]);
      restore();
    });

    it('when additional connect source mixes http and websocket URLs', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_SECURITY_CSP_ADDITIONAL_CONNECT_SRC: 'https://api.example.com,wss://ws.example.com',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = securityConfig();
      expect(config.csp.additionalConnectSrc).toEqual([
        'https://api.example.com',
        'wss://ws.example.com',
      ]);
      restore();
    });
  });
});
