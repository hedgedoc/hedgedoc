/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { Loglevel } from './loglevel.enum';

export interface AppConfig {
  domain: string;
  port: number;
  loglevel: Loglevel;
}

const schema = Joi.object({
  domain: Joi.string(),
  port: Joi.number().default(3000).optional(),
  loglevel: Joi.string()
    .valid(...Object.values(Loglevel))
    .default(Loglevel.WARN)
    .optional(),
});

export default registerAs('appConfig', async () => {
  const appConfig = schema.validate(
    {
      domain: process.env.HD_DOMAIN,
      port: parseInt(process.env.PORT) || undefined,
      loglevel: process.env.HD_LOGLEVEL,
    },
    {
      abortEarly: false,
      presence: 'required',
    },
  );
  if (appConfig.error) {
    throw new Error(appConfig.error.toString());
  }
  return appConfig.value;
});
