/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Joi from 'joi';
import { BackendType } from '../media/backends/backend-type.enum';
import { registerAs } from '@nestjs/config';

export interface MediaConfig {
  backend: {
    use: BackendType;
    filesystem: {
      uploadPath: string;
    };
    s3: {
      accessKeyId: string;
      secretAccessKey: string;
      region: string;
      bucket: string;
      endPoint: string;
    };
    azure: {
      connectionString: string;
      container: string;
    };
    imgur: {
      clientID: string;
    };
  };
}

const mediaSchema = Joi.object({
  backend: {
    use: Joi.string().valid(...Object.values(BackendType)),
    filesystem: {
      uploadPath: Joi.when('...use', {
        is: Joi.valid(BackendType.FILESYSTEM),
        then: Joi.string(),
        otherwise: Joi.optional(),
      }),
    },
    s3: Joi.when('...use', {
      is: Joi.valid(BackendType.S3),
      then: Joi.object({
        accessKey: Joi.string(),
        secretKey: Joi.string(),
        endPoint: Joi.string(),
        secure: Joi.boolean(),
        port: Joi.number(),
      }),
      otherwise: Joi.optional(),
    }),
    azure: Joi.when('...use', {
      is: Joi.valid(BackendType.AZURE),
      then: Joi.object({
        connectionString: Joi.string(),
        container: Joi.string(),
      }),
      otherwise: Joi.optional(),
    }),
    imgur: Joi.when('...use', {
      is: Joi.valid(BackendType.IMGUR),
      then: Joi.object({
        clientID: Joi.string(),
      }),
      otherwise: Joi.optional(),
    }),
  },
});

export default registerAs('mediaConfig', async () => {
  const mediaConfig = mediaSchema.validate(
    {
      backend: {
        use: process.env.HD_MEDIA_BACKEND,
        filesystem: {
          uploadPath: process.env.HD_MEDIA_BACKEND_FILESYSTEM_UPLOAD_PATH,
        },
        s3: {
          accessKey: process.env.HD_MEDIA_BACKEND_S3_ACCESS_KEY,
          secretKey: process.env.HD_MEDIA_BACKEND_S3_ACCESS_KEY,
          endPoint: process.env.HD_MEDIA_BACKEND_S3_ENDPOINT,
          secure: process.env.HD_MEDIA_BACKEND_S3_SECURE,
          port: parseInt(process.env.HD_MEDIA_BACKEND_S3_PORT) || undefined,
        },
        azure: {
          connectionString:
            process.env.HD_MEDIA_BACKEND_AZURE_CONNECTION_STRING,
          container: process.env.HD_MEDIA_BACKEND_AZURE_CONTAINER,
        },
        imgur: {
          clientID: process.env.HD_MEDIA_BACKEND_IMGUR_CLIENTID,
        },
      },
    },
    {
      abortEarly: false,
      presence: 'required',
    },
  );
  if (mediaConfig.error) {
    throw new Error(mediaConfig.error.toString());
  }
  return mediaConfig.value;
});
