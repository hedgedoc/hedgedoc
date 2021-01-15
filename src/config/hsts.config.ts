/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Joi from 'joi';
import { registerAs } from '@nestjs/config';

export interface HstsConfig {
  enable: boolean;
  maxAgeSeconds: number;
  includeSubdomains: boolean;
  preload: boolean;
}

const hstsSchema = Joi.object({
  enable: Joi.boolean().default(true).optional(),
  maxAgeSeconds: Joi.number()
    .default(60 * 60 * 24 * 365)
    .optional(),
  includeSubdomains: Joi.boolean().default(true).optional(),
  preload: Joi.boolean().default(true).optional(),
});

export default registerAs('hstsConfig', async () => {
  const hstsConfig = hstsSchema.validate(
    {
      enable: process.env.HD_HSTS_ENABLE,
      maxAgeSeconds: parseInt(process.env.HD_HSTS_MAX_AGE) || undefined,
      includeSubdomains: process.env.HD_HSTS_INCLUDE_SUBDOMAINS,
      preload: process.env.HD_HSTS_PRELOAD,
    },
    {
      abortEarly: false,
      presence: 'required',
    },
  );
  if (hstsConfig.error) {
    throw new Error(hstsConfig.error.toString());
  }
  return hstsConfig.value;
});
