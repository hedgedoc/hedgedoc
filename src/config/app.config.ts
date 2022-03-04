/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { Loglevel } from './loglevel.enum';
import { buildErrorMessage, parseOptionalInt } from './utils';

export interface AppConfig {
  domain: string;
  rendererOrigin: string;
  port: number;
  loglevel: Loglevel;
}

const schema = Joi.object({
  domain: Joi.string()
    .uri({
      scheme: /https?/,
    })
    .label('HD_DOMAIN'),
  rendererOrigin: Joi.string()
    .uri({
      scheme: /https?/,
    })
    .default(Joi.ref('domain'))
    .optional()
    .label('HD_RENDERER_ORIGIN'),
  port: Joi.number()
    .positive()
    .integer()
    .default(3000)
    .max(65535)
    .optional()
    .label('PORT'),
  loglevel: Joi.string()
    .valid(...Object.values(Loglevel))
    .default(Loglevel.WARN)
    .optional()
    .label('HD_LOGLEVEL'),
});

export default registerAs('appConfig', () => {
  const appConfig = schema.validate(
    {
      domain: process.env.HD_DOMAIN,
      rendererOrigin: process.env.HD_RENDERER_ORIGIN,
      port: parseOptionalInt(process.env.PORT),
      loglevel: process.env.HD_LOGLEVEL,
    },
    {
      abortEarly: false,
      presence: 'required',
    },
  );
  if (appConfig.error) {
    const errorMessages = appConfig.error.details.map(
      (detail) => detail.message,
    );
    throw new Error(buildErrorMessage(errorMessages));
  }
  return appConfig.value as AppConfig;
});
