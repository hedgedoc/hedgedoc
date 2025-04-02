/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import z from 'zod';

import { BackendType } from '../media/backends/backend-type.enum';
import { parseOptionalBoolean } from './utils';
import {
  buildErrorMessage,
  extractDescriptionFromZodIssue,
} from './zod-error-message';

const azureSchema = z.object({
  use: z.literal(BackendType.AZURE),
  azure: z.object({
    connectionString: z
      .string()
      .describe('HD_MEDIA_BACKEND_AZURE_CONNECTION_STRING'),
    container: z.string().describe('HD_MEDIA_BACKEND_AZURE_CONTAINER'),
  }),
});

const filesystemSchema = z.object({
  use: z.literal(BackendType.FILESYSTEM),
  filesystem: z.object({
    uploadPath: z.string().describe('HD_MEDIA_BACKEND_FILESYSTEM_UPLOAD_PATH'),
  }),
});

const imgurSchema = z.object({
  use: z.literal(BackendType.IMGUR),
  imgur: z.object({
    clientId: z.string().describe('HD_MEDIA_BACKEND_IMGUR_CLIENT_ID'),
  }),
});

const s3Schema = z.object({
  use: z.literal(BackendType.S3),
  s3: z.object({
    accessKeyId: z.string().describe('HD_MEDIA_BACKEND_S3_ACCESS_KEY'),
    secretAccessKey: z.string().describe('HD_MEDIA_BACKEND_S3_SECRET_KEY'),
    bucket: z.string().describe('HD_MEDIA_BACKEND_S3_BUCKET'),
    endpoint: z.string().url().describe('HD_MEDIA_BACKEND_S3_ENDPOINT'),
    region: z.string().optional().describe('HD_MEDIA_BACKEND_S3_REGION'),
    pathStyle: z
      .boolean()
      .default(false)
      .describe('HD_MEDIA_BACKEND_S3_PATH_STYLE'),
  }),
});

const webdavSchema = z.object({
  use: z.literal(BackendType.WEBDAV),
  webdav: z.object({
    connectionString: z
      .string()
      .url()
      .describe('HD_MEDIA_BACKEND_WEBDAV_CONNECTION_STRING'),
    uploadDir: z
      .string()
      .optional()
      .describe('HD_MEDIA_BACKEND_WEBDAV_UPLOAD_DIR'),
    publicUrl: z.string().url().describe('HD_MEDIA_BACKEND_WEBDAV_PUBLIC_URL'),
  }),
});

const schema = z.object({
  backend: z.discriminatedUnion('use', [
    azureSchema,
    filesystemSchema,
    imgurSchema,
    s3Schema,
    webdavSchema,
  ]),
});

export type MediaConfig = z.infer<typeof schema>;
export type AzureMediaConfig = z.infer<typeof azureSchema>;
export type FilesystemMediaConfig = z.infer<typeof filesystemSchema>;
export type ImgurMediaConfig = z.infer<typeof imgurSchema>;
export type S3MediaConfig = z.infer<typeof s3Schema>;
export type WebdavMediaConfig = z.infer<typeof webdavSchema>;

export default registerAs('mediaConfig', () => {
  const mediaConfig = schema.safeParse({
    backend: {
      use: process.env.HD_MEDIA_BACKEND,
      filesystem: {
        uploadPath: process.env.HD_MEDIA_BACKEND_FILESYSTEM_UPLOAD_PATH,
      },
      s3: {
        accessKeyId: process.env.HD_MEDIA_BACKEND_S3_ACCESS_KEY,
        secretAccessKey: process.env.HD_MEDIA_BACKEND_S3_SECRET_KEY,
        bucket: process.env.HD_MEDIA_BACKEND_S3_BUCKET,
        endpoint: process.env.HD_MEDIA_BACKEND_S3_ENDPOINT,
        region: process.env.HD_MEDIA_BACKEND_S3_REGION,
        pathStyle: parseOptionalBoolean(
          process.env.HD_MEDIA_BACKEND_S3_PATH_STYLE,
        ),
      },
      azure: {
        connectionString: process.env.HD_MEDIA_BACKEND_AZURE_CONNECTION_STRING,
        container: process.env.HD_MEDIA_BACKEND_AZURE_CONTAINER,
      },
      imgur: {
        clientId: process.env.HD_MEDIA_BACKEND_IMGUR_CLIENT_ID,
      },
      webdav: {
        connectionString: process.env.HD_MEDIA_BACKEND_WEBDAV_CONNECTION_STRING,
        uploadDir: process.env.HD_MEDIA_BACKEND_WEBDAV_UPLOAD_DIR,
        publicUrl: process.env.HD_MEDIA_BACKEND_WEBDAV_PUBLIC_URL,
      },
    },
  });
  if (mediaConfig.error) {
    const errorMessages = mediaConfig.error.errors.map((issue) =>
      extractDescriptionFromZodIssue(issue, 'HD_MEDIA'),
    );
    throw new Error(buildErrorMessage(errorMessages));
  }
  return mediaConfig.data;
});
