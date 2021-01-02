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
import {GitlabScope, GitlabVersion} from "./gitlab";

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
    gitlab: [{
      baseURL: string,
      clientID: string,
      clientSecret: string,
      scope: GitlabScope,
      version: GitlabVersion
    }]
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
    gitlab: Joi.array().items(Joi.object({
      baseURL: Joi.string(),
      clientID: Joi.string(),
      clientSecret: Joi.string(),
      scope: Joi.string().valid(...Object.values(GitlabScope)).default(GitlabScope.READ_USER),
      version: Joi.string().valid(...Object.values(GitlabVersion)).default(GitlabVersion.V4)
    })).optional()
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
        gitlab: [{
          baseURL: process.env.HD_AUTH_GITLAB_BASE_URL_0,
          clientID: process.env.HD_AUTH_GITLAB_CLIENT_ID_0,
          clientSecret: process.env.HD_AUTH_GITLAB_CLIENT_SECRET_0,
          scope: process.env.HD_AUTH_GITLAB_SCOPE_0,
          version: process.env.HD_AUTH_GITLAB_VERSION_0,
        }, {
          baseURL: process.env.HD_AUTH_GITLAB_BASE_URL_1,
          clientID: process.env.HD_AUTH_GITLAB_CLIENT_ID_1,
          clientSecret: process.env.HD_AUTH_GITLAB_CLIENT_SECRET_1,
          scope: process.env.HD_AUTH_GITLAB_SCOPE_1,
          version: process.env.HD_AUTH_GITLAB_VERSION_1,
        }, {
          baseURL: process.env.HD_AUTH_GITLAB_BASE_URL_2,
          clientID: process.env.HD_AUTH_GITLAB_CLIENT_ID_2,
          clientSecret: process.env.HD_AUTH_GITLAB_CLIENT_SECRET_2,
          scope: process.env.HD_AUTH_GITLAB_SCOPE_2,
          version: process.env.HD_AUTH_GITLAB_VERSION_2,
        }, {
          baseURL: process.env.HD_AUTH_GITLAB_BASE_URL_3,
          clientID: process.env.HD_AUTH_GITLAB_CLIENT_ID_3,
          clientSecret: process.env.HD_AUTH_GITLAB_CLIENT_SECRET_3,
          scope: process.env.HD_AUTH_GITLAB_SCOPE_3,
          version: process.env.HD_AUTH_GITLAB_VERSION_3,
        }, {
          baseURL: process.env.HD_AUTH_GITLAB_BASE_URL_4,
          clientID: process.env.HD_AUTH_GITLAB_CLIENT_ID_4,
          clientSecret: process.env.HD_AUTH_GITLAB_CLIENT_SECRET_4,
          scope: process.env.HD_AUTH_GITLAB_SCOPE_4,
          version: process.env.HD_AUTH_GITLAB_VERSION_4,
        }]
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
