/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface AppConfig {
  port: number;
  media: {
    backend: {
      use: string;
      filesystem: {
        uploadPath: string;
      };
    };
  };
}

const schema = Joi.object({
  port: Joi.number(),
  media: {
    backend: {
      use: Joi.string().valid('filesystem'),
      filesystem: {
        uploadPath: Joi.when('...use', {
          is: Joi.valid('filesystem'),
          then: Joi.string(),
          otherwise: Joi.optional(),
        }),
      },
    },
  },
});

export default registerAs('appConfig', async () => {
  const appConfig = schema.validate(
    {
      port: parseInt(process.env.PORT) || undefined,
      media: {
        backend: {
          use: process.env.HD_MEDIA_BACKEND,
          filesystem: {
            uploadPath: process.env.HD_MEDIA_BACKEND_FILESYSTEM_UPLOAD_PATH,
          },
        },
      },
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
