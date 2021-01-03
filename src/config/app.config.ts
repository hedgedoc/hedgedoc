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
    }],
    // ToDo: tlsOptions exist in config.json.example. See https://nodejs.org/api/tls.html#tls_tls_connect_options_callback
    ldap: [{
      providerName: string,
      url: string,
      bindDn: string,
      bindCredentials: string,
      searchBase: string,
      searchFilter: string,
      searchAttributes: string[],
      usernameField: string,
      useridField: string,
      tlsCa: string[]
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
    })).optional(),
    // ToDo: should searchfilter have a default?
    ldap: Joi.array().items(Joi.object({
      providerName: Joi.string().default('LDAP'),
      url: Joi.string(),
      bindDn: Joi.string().optional(),
      bindCredentials: Joi.string().optional(),
      searchBase: Joi.string(),
      searchFilter: Joi.string().optional().default('(uid={{username}})'),
      searchAttributes: Joi.array().items(Joi.string()),
      usernameField: Joi.string().optional().default('userid'),
      useridField: Joi.string().optional(),
      tlsCa: Joi.array().items(Joi.string()).optional(),
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
        }],
        ldap: [{
          providerName: process.env.HD_AUTH_LDAP_PROVIDER_NAME_0,
          url: process.env.HD_AUTH_LDAP_URL_0,
          bindDn: process.env.HD_AUTH_LDAP_BIND_DN_0,
          bindCredentials: process.env.HD_AUTH_LDAP_BIND_CREDENTIALS_0,
          searchBase: process.env.HD_AUTH_LDAP_SEARCH_BASE_0,
          searchFilter: process.env.HD_AUTH_LDAP_SEARCH_FILTER_0,
          searchAttributes: process.env.HD_AUTH_LDAP_SEARCH_ATTRIBUTES_0.split(',').map(attribute => attribute.trim()),
          usernameField: process.env.HD_AUTH_LDAP_USERNAME_FIELD_0,
          useridField: process.env.HD_AUTH_LDAP_USERID_FIELD_0,
          tlsCa: process.env.HD_AUTH_LDAP_TLS_CA_0.split(',').map(attribute => attribute.trim()),
        }, {
          providerName: process.env.HD_AUTH_LDAP_PROVIDER_NAME_1,
          url: process.env.HD_AUTH_LDAP_URL_1,
          bindDn: process.env.HD_AUTH_LDAP_BIND_DN_1,
          bindCredentials: process.env.HD_AUTH_LDAP_BIND_CREDENTIALS_1,
          searchBase: process.env.HD_AUTH_LDAP_SEARCH_BASE_1,
          searchFilter: process.env.HD_AUTH_LDAP_SEARCH_FILTER_1,
          searchAttributes: process.env.HD_AUTH_LDAP_SEARCH_ATTRIBUTES_1.split(',').map(attribute => attribute.trim()),
          usernameField: process.env.HD_AUTH_LDAP_USERNAME_FIELD_1,
          useridField: process.env.HD_AUTH_LDAP_USERID_FIELD_1,
          tlsCa: process.env.HD_AUTH_LDAP_TLS_CA_1.split(',').map(attribute => attribute.trim()),
        }, {
          providerName: process.env.HD_AUTH_LDAP_PROVIDER_NAME_2,
          url: process.env.HD_AUTH_LDAP_URL_2,
          bindDn: process.env.HD_AUTH_LDAP_BIND_DN_2,
          bindCredentials: process.env.HD_AUTH_LDAP_BIND_CREDENTIALS_2,
          searchBase: process.env.HD_AUTH_LDAP_SEARCH_BASE_2,
          searchFilter: process.env.HD_AUTH_LDAP_SEARCH_FILTER_2,
          searchAttributes: process.env.HD_AUTH_LDAP_SEARCH_ATTRIBUTES_2.split(',').map(attribute => attribute.trim()),
          usernameField: process.env.HD_AUTH_LDAP_USERNAME_FIELD_2,
          useridField: process.env.HD_AUTH_LDAP_USERID_FIELD_2,
          tlsCa: process.env.HD_AUTH_LDAP_TLS_CA_2.split(',').map(attribute => attribute.trim()),
        }, {
          providerName: process.env.HD_AUTH_LDAP_PROVIDER_NAME_3,
          url: process.env.HD_AUTH_LDAP_URL_3,
          bindDn: process.env.HD_AUTH_LDAP_BIND_DN_3,
          bindCredentials: process.env.HD_AUTH_LDAP_BIND_CREDENTIALS_3,
          searchBase: process.env.HD_AUTH_LDAP_SEARCH_BASE_3,
          searchFilter: process.env.HD_AUTH_LDAP_SEARCH_FILTER_3,
          searchAttributes: process.env.HD_AUTH_LDAP_SEARCH_ATTRIBUTES_3.split(',').map(attribute => attribute.trim()),
          usernameField: process.env.HD_AUTH_LDAP_USERNAME_FIELD_3,
          useridField: process.env.HD_AUTH_LDAP_USERID_FIELD_3,
          tlsCa: process.env.HD_AUTH_LDAP_TLS_CA_3.split(',').map(attribute => attribute.trim()),
        }, {
          providerName: process.env.HD_AUTH_LDAP_PROVIDER_NAME_4,
          url: process.env.HD_AUTH_LDAP_URL_4,
          bindDn: process.env.HD_AUTH_LDAP_BIND_DN_4,
          bindCredentials: process.env.HD_AUTH_LDAP_BIND_CREDENTIALS_4,
          searchBase: process.env.HD_AUTH_LDAP_SEARCH_BASE_4,
          searchFilter: process.env.HD_AUTH_LDAP_SEARCH_FILTER_4,
          searchAttributes: process.env.HD_AUTH_LDAP_SEARCH_ATTRIBUTES_4.split(',').map(attribute => attribute.trim()),
          usernameField: process.env.HD_AUTH_LDAP_USERNAME_FIELD_4,
          useridField: process.env.HD_AUTH_LDAP_USERID_FIELD_4,
          tlsCa: process.env.HD_AUTH_LDAP_TLS_CA_4.split(',').map(attribute => attribute.trim()),
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
