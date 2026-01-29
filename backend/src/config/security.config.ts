/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import z from 'zod';

import { parseOptionalNumber, printConfigErrorAndExit } from './utils';
import { buildErrorMessage, extractDescriptionFromZodIssue } from './zod-error-message';

const securityConfigSchema = z.object({
  rateLimit: z.object({
    publicApi: z.object({
      max: z
        .number()
        .int()
        .nonnegative()
        .default(150)
        .describe('HD_SECURITY_RATE_LIMIT_PUBLIC_API_MAX'),
      window: z
        .number()
        .int()
        .positive()
        .default(300)
        .describe('HD_SECURITY_RATE_LIMIT_PUBLIC_API_WINDOW'),
    }),
    authenticated: z.object({
      max: z
        .number()
        .int()
        .nonnegative()
        .default(900)
        .describe('HD_SECURITY_RATE_LIMIT_AUTHENTICATED_MAX'),
      window: z
        .number()
        .int()
        .positive()
        .default(300)
        .describe('HD_SECURITY_RATE_LIMIT_AUTHENTICATED_WINDOW'),
    }),
    unauthenticated: z.object({
      max: z
        .number()
        .int()
        .nonnegative()
        .default(100)
        .describe('HD_SECURITY_RATE_LIMIT_UNAUTHENTICATED_MAX'),
      window: z
        .number()
        .int()
        .positive()
        .default(300)
        .describe('HD_SECURITY_RATE_LIMIT_UNAUTHENTICATED_WINDOW'),
    }),
    auth: z.object({
      max: z.number().int().nonnegative().default(20).describe('HD_SECURITY_RATE_LIMIT_AUTH_MAX'),
      window: z
        .number()
        .int()
        .positive()
        .default(600)
        .describe('HD_SECURITY_RATE_LIMIT_AUTH_WINDOW'),
    }),
    bypass: z
      .array(z.string().ip())
      .optional()
      .default([])
      .describe('HD_SECURITY_RATE_LIMIT_BYPASS'),
  }),
});

export type SecurityConfig = z.infer<typeof securityConfigSchema>;

export default registerAs('securityConfig', () => {
  const securityConfig = securityConfigSchema.safeParse({
    rateLimit: {
      publicApi: {
        max: parseOptionalNumber(process.env.HD_SECURITY_RATE_LIMIT_PUBLIC_API_MAX),
        window: parseOptionalNumber(process.env.HD_SECURITY_RATE_LIMIT_PUBLIC_API_WINDOW),
      },
      authenticated: {
        max: parseOptionalNumber(process.env.HD_SECURITY_RATE_LIMIT_AUTHENTICATED_MAX),
        window: parseOptionalNumber(process.env.HD_SECURITY_RATE_LIMIT_AUTHENTICATED_WINDOW),
      },
      unauthenticated: {
        max: parseOptionalNumber(process.env.HD_SECURITY_RATE_LIMIT_UNAUTHENTICATED_MAX),
        window: parseOptionalNumber(process.env.HD_SECURITY_RATE_LIMIT_UNAUTHENTICATED_WINDOW),
      },
      auth: {
        max: parseOptionalNumber(process.env.HD_SECURITY_RATE_LIMIT_AUTH_MAX),
        window: parseOptionalNumber(process.env.HD_SECURITY_RATE_LIMIT_AUTH_WINDOW),
      },
      bypass: process.env.HD_SECURITY_RATE_LIMIT_BYPASS?.split(',') ?? [],
    },
  });

  if (securityConfig.error) {
    const errorMessages = securityConfig.error.errors.map((issue) =>
      extractDescriptionFromZodIssue(issue, 'HD_SECURITY'),
    );
    const errorMessage = buildErrorMessage(errorMessages);
    return printConfigErrorAndExit(errorMessage);
  }
  return securityConfig.data;
});
