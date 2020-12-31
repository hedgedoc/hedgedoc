/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Joi from 'joi';

export interface CspConfig {
  enable: boolean;
  maxAgeSeconds: number;
  includeSubdomains: boolean;
  preload: boolean;
}

export const cspSchema = Joi.object({
  enable: Joi.boolean().default(true).optional(),
  reportURI: Joi.string().optional(),
});

export const appConfigCsp = {
  enable: process.env.HD_CSP_ENABLE || true,
  reportURI: process.env.HD_CSP_REPORTURI,
};
