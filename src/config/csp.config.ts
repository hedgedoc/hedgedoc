/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Joi from 'joi';
import { registerAs } from '@nestjs/config';

export interface CspConfig {
  enable: boolean;
  maxAgeSeconds: number;
  includeSubdomains: boolean;
  preload: boolean;
}

const cspSchema = Joi.object({
  enable: Joi.boolean().default(true).optional(),
  reportURI: Joi.string().optional(),
});

export default registerAs('cspConfig', async () => {
  const cspConfig = cspSchema.validate(
    {
      enable: process.env.HD_CSP_ENABLE || true,
      reportURI: process.env.HD_CSP_REPORTURI,
    },
    {
      abortEarly: false,
      presence: 'required',
    },
  );
  if (cspConfig.error) {
    throw new Error(cspConfig.error.toString());
  }
  return cspConfig.value;
});
