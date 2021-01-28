/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Joi from 'joi';
import { registerAs } from '@nestjs/config';
import { buildErrorMessage } from './utils';

export interface CspConfig {
  enable: boolean;
  reportURI: string;
}

const cspSchema = Joi.object({
  enable: Joi.boolean().default(true).optional().label('HD_CSP_ENABLE'),
  reportURI: Joi.string().optional().label('HD_CSP_REPORT_URI'),
});

export default registerAs('cspConfig', async () => {
  const cspConfig = cspSchema.validate(
    {
      enable: process.env.HD_CSP_ENABLE || true,
      reportURI: process.env.HD_CSP_REPORT_URI,
    },
    {
      abortEarly: false,
      presence: 'required',
    },
  );
  if (cspConfig.error) {
    const errorMessages = await cspConfig.error.details.map(
      (detail) => detail.message,
    );
    throw new Error(buildErrorMessage(errorMessages));
  }
  return cspConfig.value;
});
