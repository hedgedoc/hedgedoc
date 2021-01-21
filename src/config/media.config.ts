/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Joi from 'joi';
import { BackendType } from '../media/backends/backend-type.enum';
import { registerAs } from '@nestjs/config';
import { buildErrorMessage } from './utils';

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
    use: Joi.string()
      .valid(...Object.values(BackendType))
      .label('HD_MEDIA_BACKEND'),
    filesystem: {
      uploadPath: Joi.when('...use', {
        is: Joi.valid(BackendType.FILESYSTEM),
        then: Joi.string(),
        otherwise: Joi.optional(),
      }).label('HD_MEDIA_BACKEND_FILESYSTEM_UPLOAD_PATH'),
    },
    s3: Joi.when('...use', {
      is: Joi.valid(BackendType.S3),
      then: Joi.object({
        accessKey: Joi.string().label('HD_MEDIA_BACKEND_S3_ACCESS_KEY'),
        secretKey: Joi.string().label('HD_MEDIA_BACKEND_S3_SECRET_KEY'),
        endPoint: Joi.string().label('HD_MEDIA_BACKEND_S3_ENDPOINT'),
        secure: Joi.boolean().label('HD_MEDIA_BACKEND_S3_SECURE'),
        port: Joi.number().label('HD_MEDIA_BACKEND_S3_PORT'),
      }),
      otherwise: Joi.optional(),
    }),
    azure: Joi.when('...use', {
      is: Joi.valid(BackendType.AZURE),
      then: Joi.object({
        connectionString: Joi.string().label(
          'HD_MEDIA_BACKEND_AZURE_CONNECTION_STRING',
        ),
        container: Joi.string().label('HD_MEDIA_BACKEND_AZURE_CONTAINER'),
      }),
      otherwise: Joi.optional(),
    }),
    imgur: Joi.when('...use', {
      is: Joi.valid(BackendType.IMGUR),
      then: Joi.object({
        clientID: Joi.string().label('HD_MEDIA_BACKEND_IMGUR_CLIENTID'),
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
          secretKey: process.env.HD_MEDIA_BACKEND_S3_SECRET_KEY,
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
    const errorMessages = await mediaConfig.error.details.map(
      (detail) => detail.message,
    );
    throw new Error(buildErrorMessage(errorMessages));
  }
  return mediaConfig.value;
});
