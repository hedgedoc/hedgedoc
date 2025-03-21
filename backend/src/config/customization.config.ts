/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { buildErrorMessage } from './utils';

export interface CustomizationConfig {
  branding: {
    customName: string | null;
    customLogo: string | null;
  };
  specialUrls: {
    privacy: string | null;
    termsOfUse: string | null;
    imprint: string | null;
  };
}

const schema = Joi.object({
  branding: Joi.object({
    customName: Joi.string().allow(null).label('HD_CUSTOM_NAME'),
    customLogo: Joi.string()
      .uri({
        scheme: [/https?/],
      })
      .allow(null)
      .label('HD_CUSTOM_LOGO'),
  }),
  specialUrls: Joi.object({
    privacy: Joi.string()
      .uri({
        scheme: /https?/,
      })
      .allow(null)
      .label('HD_PRIVACY_URL'),
    termsOfUse: Joi.string()
      .uri({
        scheme: /https?/,
      })
      .allow(null)
      .label('HD_TERMS_OF_USE_URL'),
    imprint: Joi.string()
      .uri({
        scheme: /https?/,
      })
      .allow(null)
      .label('HD_IMPRINT_URL'),
  }),
});

export default registerAs('customizationConfig', () => {
  const customizationConfig = schema.validate(
    {
      branding: {
        customName: process.env.HD_CUSTOM_NAME ?? null,
        customLogo: process.env.HD_CUSTOM_LOGO ?? null,
      },
      specialUrls: {
        privacy: process.env.HD_PRIVACY_URL ?? null,
        termsOfUse: process.env.HD_TERMS_OF_USE_URL ?? null,
        imprint: process.env.HD_IMPRINT_URL ?? null,
      },
    },
    {
      abortEarly: false,
      presence: 'required',
    },
  );
  if (customizationConfig.error) {
    const errorMessages = customizationConfig.error.details.map(
      (detail) => detail.message,
    );
    throw new Error(buildErrorMessage(errorMessages));
  }
  return customizationConfig.value as CustomizationConfig;
});
