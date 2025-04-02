/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  NoSubdirectoryAllowedError,
  parseUrl,
  WrongProtocolError,
} from '@hedgedoc/commons';
import { registerAs } from '@nestjs/config';
import z, { RefinementCtx } from 'zod';

import { Loglevel } from './loglevel.enum';
import { parseOptionalBoolean, parseOptionalNumber } from './utils';
import {
  buildErrorMessage,
  extractDescriptionFromZodIssue,
} from './zod-error-message';

function validateUrl(value: string | undefined, ctx: RefinementCtx): void {
  if (!value) {
    return z.NEVER;
  }
  try {
    if (!parseUrl(value).isPresent()) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_string,
        message: "Can't parse as URL",
        fatal: true,
        validation: 'url',
      });
      return z.NEVER;
    }
  } catch (error) {
    if (error instanceof NoSubdirectoryAllowedError) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_string,
        message: ctx.path[0] + ' must not contain a subdirectory',
        fatal: true,
        validation: 'url',
      });
    } else if (error instanceof WrongProtocolError) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_string,
        message: ctx.path[0] + ' protocol must be HTTP or HTTPS',
        fatal: true,
        validation: 'url',
      });
    } else {
      throw error;
    }
  }
}

const schema = z
  .object({
    baseUrl: z.string().superRefine(validateUrl).describe('HD_BASE_URL'),
    rendererBaseUrl: z
      .string()
      .superRefine(validateUrl)
      .default('')
      .describe('HD_RENDERER_BASE_URL'),
    backendPort: z
      .number()
      .positive()
      .int()
      .max(65535)
      .default(3000)
      .describe('HD_BACKEND_PORT'),
    loglevel: z
      .enum(Object.values(Loglevel) as [Loglevel, ...Loglevel[]])
      .default(Loglevel.WARN)
      .describe('HD_LOGLEVEL'),
    showLogTimestamp: z
      .boolean()
      .default(true)
      .describe('HD_SHOW_LOG_TIMESTAMP'),
    persistInterval: z.coerce
      .number()
      .int()
      .min(0)
      .default(10)
      .describe('HD_PERSIST_INTERVAL'),
  })
  .transform((data) => {
    // Handle the default reference for rendererBaseUrl
    if (data.rendererBaseUrl === '') {
      data.rendererBaseUrl = data.baseUrl;
    }
    return data;
  });

export type AppConfig = z.infer<typeof schema>;

export default registerAs('appConfig', () => {
  const appConfig = schema.safeParse({
    baseUrl: process.env.HD_BASE_URL,
    rendererBaseUrl: process.env.HD_RENDERER_BASE_URL,
    backendPort: parseOptionalNumber(process.env.HD_BACKEND_PORT),
    loglevel: process.env.HD_LOGLEVEL,
    showLogTimestamp: parseOptionalBoolean(process.env.HD_SHOW_LOG_TIMESTAMP),
    persistInterval: process.env.HD_PERSIST_INTERVAL,
  });
  if (appConfig.error) {
    const errorMessages = appConfig.error.errors.map((issue) =>
      extractDescriptionFromZodIssue(issue, 'HD'),
    );
    throw new Error(buildErrorMessage(errorMessages));
  }
  return appConfig.data;
});
