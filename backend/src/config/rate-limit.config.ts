/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import z from 'zod';

import { parseOptionalNumber, printConfigErrorAndExit } from './utils';
import { buildErrorMessage, extractDescriptionFromZodIssue } from './zod-error-message';

const rateLimitConfigSchema = z.object({
  public: z.object({
    max: z.number().int().nonnegative().describe('HD_SECURITY_RATE_LIMIT_PUBLIC_MAX'),
    window: z.number().int().positive().describe('HD_SECURITY_RATE_LIMIT_PUBLIC_WINDOW'),
  }),
  privateAuthenticated: z.object({
    max: z.number().int().nonnegative().describe('HD_SECURITY_RATE_LIMIT_PRIVATE_AUTH_MAX'),
    window: z.number().int().positive().describe('HD_SECURITY_RATE_LIMIT_PRIVATE_AUTH_WINDOW'),
  }),
  privateUnauthenticated: z.object({
    max: z.number().int().nonnegative().describe('HD_SECURITY_RATE_LIMIT_PRIVATE_UNAUTH_MAX'),
    window: z.number().int().positive().describe('HD_SECURITY_RATE_LIMIT_PRIVATE_UNAUTH_WINDOW'),
  }),
  login: z.object({
    max: z.number().int().nonnegative().describe('HD_SECURITY_RATE_LIMIT_LOGIN_MAX'),
    window: z.number().int().positive().describe('HD_SECURITY_RATE_LIMIT_LOGIN_WINDOW'),
  }),
});

export type RateLimitConfig = z.infer<typeof rateLimitConfigSchema>;

export default registerAs('rateLimit', () => {
  const rateLimitConfig = rateLimitConfigSchema.safeParse({
    public: {
      max: parseOptionalNumber(process.env.HD_SECURITY_RATE_LIMIT_PUBLIC_MAX) ?? 150,
      window: parseOptionalNumber(process.env.HD_SECURITY_RATE_LIMIT_PUBLIC_WINDOW) ?? 300,
    },
    privateAuthenticated: {
      max: parseOptionalNumber(process.env.HD_SECURITY_RATE_LIMIT_PRIVATE_AUTH_MAX) ?? 600,
      window: parseOptionalNumber(process.env.HD_SECURITY_RATE_LIMIT_PRIVATE_AUTH_WINDOW) ?? 300,
    },
    privateUnauthenticated: {
      max: parseOptionalNumber(process.env.HD_SECURITY_RATE_LIMIT_PRIVATE_UNAUTH_MAX) ?? 100,
      window: parseOptionalNumber(process.env.HD_SECURITY_RATE_LIMIT_PRIVATE_UNAUTH_WINDOW) ?? 300,
    },
    login: {
      max: parseOptionalNumber(process.env.HD_SECURITY_RATE_LIMIT_LOGIN_MAX) ?? 20,
      window: parseOptionalNumber(process.env.HD_SECURITY_RATE_LIMIT_LOGIN_WINDOW) ?? 600,
    },
  });

  if (rateLimitConfig.error) {
    const errorMessages = rateLimitConfig.error.errors.map((issue) =>
      extractDescriptionFromZodIssue(issue, 'HD_SECURITY_RATE_LIMIT'),
    );
    const errorMessage = buildErrorMessage(errorMessages);
    return printConfigErrorAndExit(errorMessage);
  }
  return rateLimitConfig.data;
});
