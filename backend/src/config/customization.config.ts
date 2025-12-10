/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import z from 'zod';

import { printConfigErrorAndExit } from './utils';
import {
  buildErrorMessage,
  extractDescriptionFromZodIssue,
} from './zod-error-message';

const schema = z.object({
  branding: z.object({
    customName: z.string().or(z.null()).describe('HD_BRANDING_CUSTOM_NAME'),
    customLogo: z
      .string()
      .url()
      .or(z.null())
      .describe('HD_BRANDING_CUSTOM_LOGO'),
  }),
  urls: z.object({
    privacy: z.string().url().or(z.null()).describe('HD_URLS_PRIVACY'),
    termsOfUse: z.string().url().or(z.null()).describe('HD_URLS_TERMS_OF_USE'),
    imprint: z.string().url().or(z.null()).describe('HD_URLS_IMPRINT'),
  }),
});

export type CustomizationConfig = z.infer<typeof schema>;

export default registerAs('customizationConfig', () => {
  const customizationConfig = schema.safeParse({
    branding: {
      customName: process.env.HD_BRANDING_CUSTOM_NAME ?? null,
      customLogo: process.env.HD_BRANDING_CUSTOM_LOGO ?? null,
    },
    urls: {
      privacy: process.env.HD_URLS_PRIVACY ?? null,
      termsOfUse: process.env.HD_URLS_TERMS_OF_USE ?? null,
      imprint: process.env.HD_URLS_IMPRINT ?? null,
    },
  });
  if (customizationConfig.error) {
    const errorMessages = customizationConfig.error.errors.map((issue) =>
      extractDescriptionFromZodIssue(issue, 'HD'),
    );
    const errorMessage = buildErrorMessage(errorMessages);
    return printConfigErrorAndExit(errorMessage);
  }
  return customizationConfig.data;
});
