/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  NoSubdirectoryAllowedError,
  parseUrl,
  WrongProtocolError,
} from '@hedgedoc/commons';
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { CustomHelpers, ErrorReport } from 'joi';

import { Loglevel } from './loglevel.enum';
import { buildErrorMessage, parseOptionalNumber } from './utils';

export interface AppConfig {
  baseUrl: string;
  rendererBaseUrl: string;
  port: number;
  loglevel: Loglevel;
  persistInterval: number;
}

function validateUrl(
  value: string,
  helpers: CustomHelpers,
): string | ErrorReport {
  try {
    return parseUrl(value).isPresent() ? value : helpers.error('string.uri');
  } catch (error) {
    if (error instanceof NoSubdirectoryAllowedError) {
      return helpers.error('url.noSubDirectoryAllowed');
    } else if (error instanceof WrongProtocolError) {
      return helpers.error('url.wrongProtocol');
    } else {
      throw error;
    }
  }
}

const schema = Joi.object({
  baseUrl: Joi.string().custom(validateUrl).label('HD_BASE_URL'),
  rendererBaseUrl: Joi.string()
    .custom(validateUrl)
    .default(Joi.ref('baseUrl'))
    .optional()
    .label('HD_RENDERER_BASE_URL'),
  port: Joi.number()
    .positive()
    .integer()
    .default(3000)
    .max(65535)
    .optional()
    .label('HD_BACKEND_PORT'),
  loglevel: Joi.string()
    .valid(...Object.values(Loglevel))
    .default(Loglevel.WARN)
    .optional()
    .label('HD_LOGLEVEL'),
  persistInterval: Joi.number()
    .integer()
    .min(0)
    .default(10)
    .optional()
    .label('HD_PERSIST_INTERVAL'),
}).messages({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'url.noSubDirectoryAllowed': '{{#label}} must not contain a subdirectory',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'url.wrongProtocol': '{{#label}} protocol must be HTTP or HTTPS',
});

export default registerAs('appConfig', () => {
  const appConfig = schema.validate(
    {
      baseUrl: process.env.HD_BASE_URL,
      rendererBaseUrl: process.env.HD_RENDERER_BASE_URL,
      port: parseOptionalNumber(process.env.HD_BACKEND_PORT),
      loglevel: process.env.HD_LOGLEVEL,
      persistInterval: process.env.HD_PERSIST_INTERVAL,
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
