/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { HelmetOptions } from 'helmet';

import { AppConfig } from '../config/app.config';
import { SecurityConfig } from '../config/security.config';

/**
 * Build CSP directives based on configuration
 *
 * @param appConfig - Application configuration
 * @param securityConfig - Security configuration
 * @returns CSP directives configuration for helmet
 */
export function buildCspDirectives(
  appConfig: AppConfig,
  securityConfig: SecurityConfig,
): NonNullable<HelmetOptions['contentSecurityPolicy']> {
  const isSameDomain = appConfig.rendererBaseUrl === appConfig.baseUrl;

  // Base secure defaults
  const scriptSrc = ["'self'", ...securityConfig.csp.additionalScriptSrc];
  const styleSrc = ["'self'", "'unsafe-inline'", ...securityConfig.csp.additionalStyleSrc];
  const imgSrc = [
    "'self'",
    'data:',
    'blob:',
    'https://i.ytimg.com',
    'https://i.vimeocdn.com',
    'https://cdn.jsdelivr.net',
    ...securityConfig.csp.additionalImgSrc,
  ];
  const fontSrc = ["'self'", 'data:'];
  const connectSrc = ["'self'", 'https://vimeo.com', ...securityConfig.csp.additionalConnectSrc];
  const mediaSrc = ["'self'", 'blob:'];
  const objectSrc = ["'none'"];
  const baseUri = ["'self'"];
  const formAction = ["'self'"];

  // Frame sources depend on whether renderer is on same domain
  const frameSrc = [
    "'self'",
    'https://www.youtube-nocookie.com',
    'https://player.vimeo.com',
    ...securityConfig.csp.additionalFrameSrc,
  ];

  // If renderer is on different domain, add it to frame-src
  if (!isSameDomain) {
    try {
      const rendererOrigin = new URL(appConfig.rendererBaseUrl).origin;
      frameSrc.push(rendererOrigin);
    } catch {
      // Invalid URL, skip adding to frame-src (likely in test environment)
    }
  }

  const directives: Record<string, string[] | string> = {
    defaultSrc: ["'self'"],
    scriptSrc,
    styleSrc,
    imgSrc,
    fontSrc,
    connectSrc,
    mediaSrc,
    objectSrc,
    baseUri,
    formAction,
    frameSrc,
    upgradeInsecureRequests: [],
  };

  // Add report URI if configured
  if (securityConfig.csp.reportUri) {
    directives.reportUri = securityConfig.csp.reportUri;
  }

  return {
    directives,
    reportOnly: securityConfig.csp.reportOnly,
  };
}
