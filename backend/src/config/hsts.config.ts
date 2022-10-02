/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { buildErrorMessage, parseOptionalNumber } from './utils';

export interface HstsConfig {
  enable: boolean;
  maxAgeSeconds: number;
  includeSubdomains: boolean;
  preload: boolean;
}

const hstsSchema = Joi.object({
  enable: Joi.boolean().default(true).optional().label('HD_HSTS_ENABLE'),
  maxAgeSeconds: Joi.number()
    .default(60 * 60 * 24 * 365)
    .optional()
    .label('HD_HSTS_MAX_AGE'),
  includeSubdomains: Joi.boolean()
    .default(true)
    .optional()
    .label('HD_HSTS_INCLUDE_SUBDOMAINS'),
  preload: Joi.boolean().default(true).optional().label('HD_HSTS_PRELOAD'),
});

export default registerAs('hstsConfig', () => {
  const hstsConfig = hstsSchema.validate(
    {
      enable: process.env.HD_HSTS_ENABLE,
      maxAgeSeconds: parseOptionalNumber(process.env.HD_HSTS_MAX_AGE),
      includeSubdomains: process.env.HD_HSTS_INCLUDE_SUBDOMAINS,
      preload: process.env.HD_HSTS_PRELOAD,
    },
    {
      abortEarly: false,
      presence: 'required',
    },
  );
  if (hstsConfig.error) {
    const errorMessages = hstsConfig.error.details.map(
      (detail) => detail.message,
    );
    throw new Error(buildErrorMessage(errorMessages));
  }
  return hstsConfig.value as HstsConfig;
});
