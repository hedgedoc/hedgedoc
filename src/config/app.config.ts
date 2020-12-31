/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import {LogLevel} from "./loglevel";
import {DatabaseDialect} from "./database_dialect";
import {MediaBackend} from "./media_backend";

export interface AppConfig {
  domain: string;
  port: number;
  loglevel: LogLevel;
  media: {
    backend: {
      use: MediaBackend;
      filesystem: {
        uploadPath: string;
      };
    };
  };
  database: {
    username: string;
    password: string;
    database: string;
    host: string;
    port: number;
    dialect: DatabaseDialect;
  };
  auth: {
    facebook: {
      clientID: string;
      clientSecret: string;
    },
    twitter: {
      consumerKey: string;
      consumerSecret: string;
    },
    github: {
      clientID: string,
      clientSecret: string,
    },
    dropbox: {
      clientID: string,
      clientSecret: string,
      appKey: string,
    },
    google: {
      clientID: string,
      clientSecret: string,
      apiKey: string,
    },
  };
}

const schema = Joi.object({
  domain: Joi.string(),
  port: Joi.number(),
  loglevel: Joi.string().valid(...Object.values(LogLevel)).default(LogLevel.WARN),
  media: {
    backend: {
      use: Joi.string().valid(...Object.values(MediaBackend)),
      filesystem: {
        uploadPath: Joi.when('...use', {
          is: Joi.valid(MediaBackend.FILESYSTEM),
          then: Joi.string(),
          otherwise: Joi.optional(),
        }),
      },
    },
  },
  database: {
    username: Joi.string(),
    password: Joi.string(),
    database: Joi.string(),
    host: Joi.string(),
    port: Joi.number(),
    dialect: Joi.string().valid(...Object.values(DatabaseDialect)),
  },
  auth: {
    facebook: {
      clientID: Joi.string(),
      clientSecret: Joi.string(),
    },
    twitter: {
      consumerKey: Joi.string(),
      consumerSecret: Joi.string(),
    },
    github: {
      clientID: Joi.string(),
      clientSecret: Joi.string(),
    },
    dropbox: {
      clientID: Joi.string(),
      clientSecret: Joi.string(),
      appKey: Joi.string(),
    },
    google: {
      clientID: Joi.string(),
      clientSecret: Joi.string(),
      apiKey: Joi.string(),
    },
  }
});

export default registerAs('appConfig', async () => {
  const appConfig = schema.validate(
    {
      domain: process.env.HD_DOMAIN,
      port: parseInt(process.env.PORT) || undefined,
      loglevel: process.env.HD_LOGLEVEL,
      media: {
        backend: {
          use: process.env.HD_MEDIA_BACKEND,
          filesystem: {
            uploadPath: process.env.HD_MEDIA_BACKEND_FILESYSTEM_UPLOAD_PATH,
          },
        },
      },
      database: {
        username: process.env.HD_DATABASE_USER,
        password: process.env.HD_DATABASE_PASS,
        database: process.env.HD_DATABASE_NAME,
        host: process.env.HD_DATABASE_HOST,
        port: process.env.HD_DATABASE_PORT,
        dialect: process.env.HD_DATABASE_DIALECT,
      },
      auth: {
        facebook: {
          clientID: process.env.HD_AUTH_FACEBOOK_CLIENT_ID,
          clientSecret: process.env.HD_AUTH_FACEBOOK_CLIENT_SECRET,
        },
        twitter: {
          consumerKey: process.env.HD_AUTH_TWITTER_CONSUMER_KEY,
          consumerSecret: process.env.HD_AUTH_TWITTER_CONSUMER_SECRET,
        },
        github: {
          clientID: process.env.HD_AUTH_GITHUB_CLIENT_ID,
          clientSecret: process.env.HD_AUTH_GITHUB_CLIENT_SECRET,
        },
        dropbox: {
          clientID: process.env.HD_AUTH_DROPBOX_CLIENT_ID,
          clientSecret: process.env.HD_AUTH_DROPBOX_CLIENT_SECRET,
          appKey: process.env.HD_AUTH_DROPBOX_APP_KEY,
        },
        google: {
          clientID: process.env.HD_AUTH_GOOGLE_CLIENT_ID,
          clientSecret: process.env.HD_AUTH_GOOGLE_CLIENT_SECRET,
          appKey: process.env.HD_AUTH_GOOGLE_APP_KEY,
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
