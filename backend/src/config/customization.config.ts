/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import z from 'zod';

import {
  buildErrorMessage,
  extractDescriptionFromZodIssue,
} from './zod-error-message';

const schema = z.object({
  branding: z.object({
    customName: z.string().or(z.null()).describe('HD_CUSTOM_NAME'),
    customLogo: z.string().url().or(z.null()).describe('HD_CUSTOM_LOGO'),
  }),
  specialUrls: z.object({
    privacy: z.string().url().or(z.null()).describe('HD_PRIVACY_URL'),
    termsOfUse: z.string().url().or(z.null()).describe('HD_TERMS_OF_USE_URL'),
    imprint: z.string().url().or(z.null()).describe('HD_IMPRINT_URL'),
  }),
});

export type CustomizationConfig = z.infer<typeof schema>;

export default registerAs('customizationConfig', () => {
  const customizationConfig = schema.safeParse({
    branding: {
      customName: process.env.HD_CUSTOM_NAME ?? null,
      customLogo: process.env.HD_CUSTOM_LOGO ?? null,
    },
    specialUrls: {
      privacy: process.env.HD_PRIVACY_URL ?? null,
      termsOfUse: process.env.HD_TERMS_OF_USE_URL ?? null,
      imprint: process.env.HD_IMPRINT_URL ?? null,
    },
  });
  if (customizationConfig.error) {
    const errorMessages = customizationConfig.error.errors.map((issue) =>
      extractDescriptionFromZodIssue(issue, 'HD'),
    );
    throw new Error(buildErrorMessage(errorMessages));
  }
  return customizationConfig.data;
});
