/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { buildErrorMessage } from './utils';

export interface CspConfig {
  enable: boolean;
  reportURI: string;
}

const cspSchema = Joi.object({
  enable: Joi.boolean().default(true).optional().label('HD_CSP_ENABLE'),
  reportURI: Joi.string().optional().label('HD_CSP_REPORT_URI'),
});

export default registerAs('cspConfig', () => {
  if (
    process.env.HD_CSP_ENABLE !== undefined ||
    process.env.HD_CSP_REPORT_URI !== undefined
  ) {
    throw new Error(
      "CSP config is currently not yet supported. Please don't configure it",
    );
  }

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
    const errorMessages = cspConfig.error.details.map(
      (detail) => detail.message,
    );
    throw new Error(buildErrorMessage(errorMessages));
  }
  return cspConfig.value as CspConfig;
});
