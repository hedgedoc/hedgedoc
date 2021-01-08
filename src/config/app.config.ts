/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { Loglevel } from './loglevel.enum';
import { DatabaseDialect } from './database-dialect.enum';
import { GitlabScope, GitlabVersion } from './gitlab.enum';
import { toArrayConfig } from './utils';
import { BackendType } from '../media/backends/backend-type.enum';
// import { LinkifyHeaderStyle } from './linkify-header-style';

export interface AppConfig {
  domain: string;
  port: number;
  loglevel: Loglevel;
  /*linkifyHeaderStyle: LinkifyHeaderStyle;
  sourceURL: string;
  urlPath: string;
  host: string;
  path: string;
  urlAddPort: boolean;
  cookiePolicy: string;
  protocolUseSSL: boolean;
  allowOrigin: string[];
  useCDN: boolean;
  enableAnonymous: boolean;
  enableAnonymousEdits: boolean;
  enableFreeURL: boolean;
  forbiddenNoteIDs: string[];
  defaultPermission: string;
  sessionSecret: string;
  sessionLife: number;
  tooBusyLag: number;
  enableGravatar: boolean;*/
  hsts: {
    enable: boolean;
    maxAgeSeconds: number;
    includeSubdomains: boolean;
    preload: boolean;
  };
  csp: {
    enable: boolean;
    reportURI: string;
  };
  media: {
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
  };
  database: {
    username: string;
    password: string;
    database: string;
    host: string;
    port: number;
    storage: string;
    dialect: DatabaseDialect;
  };
  auth: {
    email: {
      enableLogin: boolean;
      enableRegister: boolean;
    };
    facebook: {
      clientID: string;
      clientSecret: string;
    };
    twitter: {
      consumerKey: string;
      consumerSecret: string;
    };
    github: {
      clientID: string;
      clientSecret: string;
    };
    dropbox: {
      clientID: string;
      clientSecret: string;
      appKey: string;
    };
    google: {
      clientID: string;
      clientSecret: string;
      apiKey: string;
    };
    gitlab: [
      {
        providerName: string;
        baseURL: string;
        clientID: string;
        clientSecret: string;
        scope: GitlabScope;
        version: GitlabVersion;
      },
    ];
    // ToDo: tlsOptions exist in config.json.example. See https://nodejs.org/api/tls.html#tls_tls_connect_options_callback
    ldap: [
      {
        providerName: string;
        url: string;
        bindDn: string;
        bindCredentials: string;
        searchBase: string;
        searchFilter: string;
        searchAttributes: string[];
        usernameField: string;
        useridField: string;
        tlsCa: string[];
      },
    ];
    saml: [
      {
        providerName: string;
        idpSsoUrl: string;
        idpCert: string;
        clientCert: string;
        issuer: string;
        identifierFormat: string;
        disableRequestedAuthnContext: string;
        groupAttribute: string;
        requiredGroups: string[];
        externalGroups: string;
        attribute: {
          id: string;
          username: string;
          email: string;
        };
      },
    ];
    oauth2: [
      {
        providerName: string;
        baseURL: string;
        userProfileURL: string;
        userProfileIdAttr: string;
        userProfileUsernameAttr: string;
        userProfileDisplayNameAttr: string;
        userProfileEmailAttr: string;
        tokenURL: string;
        authorizationURL: string;
        clientID: string;
        clientSecret: string;
        scope: string;
        rolesClaim: string;
        accessRole: string;
      },
    ];
  };
}

const schema = Joi.object({
  domain: Joi.string(),
  port: Joi.number().default(3000),
  loglevel: Joi.string()
    .valid(...Object.values(Loglevel))
    .default(Loglevel.WARN),
  /*linkifyHeaderStyle: Joi.string().valid(...Object.values(LinkifyHeaderStyle)).default(LinkifyHeaderStyle.GFM),
  sourceURL: Joi.string(),
  urlPath: Joi.string(),
  host: Joi.string().default('::'),
  path: Joi.string(),
  urlAddPort: Joi.boolean().default(false),
  cookiePolicy: Joi.string(),
  protocolUseSSL: Joi.boolean().default(true),
  allowOrigin: Joi.array().items(Joi.string()),
  useCDN: Joi.boolean().default(false),
  enableAnonymous: Joi.boolean().default(true),
  enableAnonymousEdits: Joi.boolean().default(false),
  enableFreeURL: Joi.boolean().default(false),
  forbiddenNoteIDs: Joi.array().items(Joi.string()),
  defaultPermission: Joi.string(),
  sessionSecret: Joi.string(),
  sessionLife: Joi.number().default(14 * 24 * 60 * 60 * 1000),
  tooBusyLag: Joi.number().default(70),
  enableGravatar: Joi.boolean().default(true),*/
  hsts: {
    enable: Joi.boolean().default(true),
    maxAgeSeconds: Joi.number().default(60 * 60 * 24 * 365),
    includeSubdomains: Joi.boolean().default(true),
    preload: Joi.boolean().default(true),
  },
  csp: {
    enable: Joi.boolean().default(true),
    reportURI: Joi.string().optional(),
  },
  media: {
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
  },
  database: {
    username: Joi.string(),
    password: Joi.string(),
    database: Joi.string(),
    host: Joi.string(),
    port: Joi.number(),
    storage: Joi.when('...dialect', {
      is: Joi.valid(DatabaseDialect.SQLITE),
      then: Joi.string(),
      otherwise: Joi.optional(),
    }),
    dialect: Joi.string().valid(...Object.values(DatabaseDialect)),
  },
  auth: {
    email: {
      enableLogin: Joi.boolean().default(false),
      enableRegister: Joi.boolean().default(false),
    },
    facebook: {
      clientID: Joi.string().optional(),
      clientSecret: Joi.string().optional(),
    },
    twitter: {
      consumerKey: Joi.string().optional(),
      consumerSecret: Joi.string().optional(),
    },
    github: {
      clientID: Joi.string().optional(),
      clientSecret: Joi.string().optional(),
    },
    dropbox: {
      clientID: Joi.string().optional(),
      clientSecret: Joi.string().optional(),
      appKey: Joi.string().optional(),
    },
    google: {
      clientID: Joi.string().optional(),
      clientSecret: Joi.string().optional(),
      apiKey: Joi.string().optional(),
    },
    gitlab: Joi.array()
      .items(
        Joi.object({
          providerName: Joi.string().default('Gitlab'),
          baseURL: Joi.string().optional(),
          clientID: Joi.string().optional(),
          clientSecret: Joi.string().optional(),
          scope: Joi.string()
            .valid(...Object.values(GitlabScope))
            .default(GitlabScope.READ_USER),
          version: Joi.string()
            .valid(...Object.values(GitlabVersion))
            .default(GitlabVersion.V4),
        }),
      )
      .optional(),
    // ToDo: should searchfilter have a default?
    ldap: Joi.array()
      .items(
        Joi.object({
          providerName: Joi.string().default('LDAP'),
          url: Joi.string().optional(),
          bindDn: Joi.string().optional(),
          bindCredentials: Joi.string().optional(),
          searchBase: Joi.string().optional(),
          searchFilter: Joi.string().default('(uid={{username}})'),
          searchAttributes: Joi.array().items(Joi.string()),
          usernameField: Joi.string().default('userid'),
          useridField: Joi.string().optional(),
          tlsCa: Joi.array().items(Joi.string()),
        }),
      )
      .optional(),
    saml: Joi.array()
      .items(
        Joi.object({
          providerName: Joi.string().default('SAML'),
          idpSsoUrl: Joi.string().optional(),
          idpCert: Joi.string().optional(),
          clientCert: Joi.string().optional(),
          // ToDo: (default: config.serverURL) will be build on-the-fly in the config/index.js from domain, urlAddPort and urlPath.
          issuer: Joi.string().optional(), //.default(),
          identifierFormat: Joi.string().default(
            'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
          ),
          disableRequestedAuthnContext: Joi.boolean().default(false),
          groupAttribute: Joi.string().optional(),
          requiredGroups: Joi.array().items(Joi.string()),
          externalGroups: Joi.array().items(Joi.string()),
          attribute: {
            id: Joi.string().default('NameId'),
            username: Joi.string().default('NameId'),
            email: Joi.string().default('NameId'),
          },
        }),
      )
      .optional(),
    oauth2: Joi.array()
      .items(
        Joi.object({
          providerName: Joi.string().default('OAuth2'),
          baseURL: Joi.string().optional(),
          userProfileURL: Joi.string().optional(),
          userProfileIdAttr: Joi.string().optional(),
          userProfileUsernameAttr: Joi.string().optional(),
          userProfileDisplayNameAttr: Joi.string().optional(),
          userProfileEmailAttr: Joi.string().optional(),
          tokenURL: Joi.string().optional(),
          authorizationURL: Joi.string().optional(),
          clientID: Joi.string().optional(),
          clientSecret: Joi.string().optional(),
          scope: Joi.string().optional(),
          rolesClaim: Joi.string().optional(),
          accessRole: Joi.string().optional(),
        }),
      )
      .optional(),
  },
});

export default registerAs('appConfig', async () => {
  const appConfig = schema.validate(
    {
      domain: process.env.HD_DOMAIN,
      port: parseInt(process.env.PORT) || 3000,
      loglevel: process.env.HD_LOGLEVEL || Loglevel.WARN,
      /*linkifyHeaderStyle: process.env.HD_LINKIFY_HEADER_STYLE,
      sourceURL: process.env.HD_SOURCE_URL,
      urlPath: process.env.HD_URL_PATH,
      host: process.env.HD_HOST || '::',
      path: process.env.HD_PATH,
      urlAddPort: process.env.HD_URL_ADDPORT || false,
      cookiePolicy: process.env.HD_COOKIE_POLICY,
      protocolUseSSL: process.env.HD_PROTOCOL_USESSL || true,
      allowOrigin: toArrayConfig(process.env.HD_ALLOW_ORIGIN),
      useCDN: process.env.HD_USECDN || false,
      enableAnonymous: process.env.HD_ENABLE_ANONYMOUS || true,
      enableAnonymousEdits: process.env.HD_ENABLE_ANONYMOUS_EDITS || false,
      enableFreeURL: process.env.HD_ENABLE_FREEURL || false,
      forbiddenNoteIDs: toArrayConfig(process.env.HD_FORBIDDEN_NOTE_IDS),
      defaultPermission: process.env.HD_DEFAULT_PERMISSION,
      sessionSecret: process.env.HD_SESSION_SECRET,
      sessionLife: parseInt(process.env.HD_SESSION_LIFE) || 14 * 24 * 60 * 60 * 1000,
      tooBusyLag: parseInt(process.env.HD_TOOBUSY_LAG) || 70,
      enableGravatar: process.env.HD_ENABLE_GRAVATAR || true,*/
      hsts: {
        enable: process.env.HD_HSTS_ENABLE || true,
        maxAgeSeconds:
          parseInt(process.env.HD_HSTS_MAX_AGE) || 60 * 60 * 24 * 365,
        includeSubdomains: process.env.HD_HSTS_INCLUDE_SUBDOMAINS || true,
        preload: process.env.HD_HSTS_PRELOAD || true,
      },
      csp: {
        enable: process.env.HD_CSP_ENABLE || true,
        reportURI: process.env.HD_CSP_REPORTURI,
      },
      media: {
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
            port:
              parseInt(process.env.HD_MEDIA_BACKEND_S3_PORT) || undefined,
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
      database: {
        username: process.env.HD_DATABASE_USER,
        password: process.env.HD_DATABASE_PASS,
        database: process.env.HD_DATABASE_NAME,
        host: process.env.HD_DATABASE_HOST,
        port: parseInt(process.env.HD_DATABASE_PORT) || undefined,
        storage: process.env.HD_DATABASE_STORAGE,
        dialect: process.env.HD_DATABASE_DIALECT,
      },
      auth: {
        email: {
          enableLogin: process.env.HD_AUTH_EMAIL_ENABLE_LOGIN || false,
          enableRegister: process.env.HD_AUTH_EMAIL_ENABLE_REGISTER || false,
        },
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
          apiKey: process.env.HD_AUTH_GOOGLE_APP_KEY,
        },
        gitlab: [
          {
            providerName:
              process.env.HD_AUTH_GITLAB_PROVIDER_NAME_0 || 'Gitlab',
            baseURL: process.env.HD_AUTH_GITLAB_BASE_URL_0,
            clientID: process.env.HD_AUTH_GITLAB_CLIENT_ID_0,
            clientSecret: process.env.HD_AUTH_GITLAB_CLIENT_SECRET_0,
            scope: process.env.HD_AUTH_GITLAB_SCOPE_0 || GitlabScope.READ_USER,
            version: process.env.HD_AUTH_GITLAB_VERSION_0 || GitlabVersion.V4,
          },
          {
            providerName:
              process.env.HD_AUTH_GITLAB_PROVIDER_NAME_1 || 'Gitlab',
            baseURL: process.env.HD_AUTH_GITLAB_BASE_URL_1,
            clientID: process.env.HD_AUTH_GITLAB_CLIENT_ID_1,
            clientSecret: process.env.HD_AUTH_GITLAB_CLIENT_SECRET_1,
            scope: process.env.HD_AUTH_GITLAB_SCOPE_1 || GitlabScope.READ_USER,
            version: process.env.HD_AUTH_GITLAB_VERSION_1 || GitlabVersion.V4,
          },
          {
            providerName:
              process.env.HD_AUTH_GITLAB_PROVIDER_NAME_2 || 'Gitlab',
            baseURL: process.env.HD_AUTH_GITLAB_BASE_URL_2,
            clientID: process.env.HD_AUTH_GITLAB_CLIENT_ID_2,
            clientSecret: process.env.HD_AUTH_GITLAB_CLIENT_SECRET_2,
            scope: process.env.HD_AUTH_GITLAB_SCOPE_2 || GitlabScope.READ_USER,
            version: process.env.HD_AUTH_GITLAB_VERSION_2 || GitlabVersion.V4,
          },
          {
            providerName:
              process.env.HD_AUTH_GITLAB_PROVIDER_NAME_3 || 'Gitlab',
            baseURL: process.env.HD_AUTH_GITLAB_BASE_URL_3,
            clientID: process.env.HD_AUTH_GITLAB_CLIENT_ID_3,
            clientSecret: process.env.HD_AUTH_GITLAB_CLIENT_SECRET_3,
            scope: process.env.HD_AUTH_GITLAB_SCOPE_3 || GitlabScope.READ_USER,
            version: process.env.HD_AUTH_GITLAB_VERSION_3 || GitlabVersion.V4,
          },
          {
            providerName:
              process.env.HD_AUTH_GITLAB_PROVIDER_NAME_4 || 'Gitlab',
            baseURL: process.env.HD_AUTH_GITLAB_BASE_URL_4,
            clientID: process.env.HD_AUTH_GITLAB_CLIENT_ID_4,
            clientSecret: process.env.HD_AUTH_GITLAB_CLIENT_SECRET_4,
            scope: process.env.HD_AUTH_GITLAB_SCOPE_4 || GitlabScope.READ_USER,
            version: process.env.HD_AUTH_GITLAB_VERSION_4 || GitlabVersion.V4,
          },
        ],
        ldap: [
          {
            providerName: process.env.HD_AUTH_LDAP_PROVIDER_NAME_0 || 'LDAP',
            url: process.env.HD_AUTH_LDAP_URL_0,
            bindDn: process.env.HD_AUTH_LDAP_BIND_DN_0,
            bindCredentials: process.env.HD_AUTH_LDAP_BIND_CREDENTIALS_0,
            searchBase: process.env.HD_AUTH_LDAP_SEARCH_BASE_0,
            searchFilter:
              process.env.HD_AUTH_LDAP_SEARCH_FILTER_0 || '(uid={{username}})',
            searchAttributes: toArrayConfig(
              process.env.HD_AUTH_LDAP_SEARCH_ATTRIBUTES_0,
              ',',
            ),
            usernameField:
              process.env.HD_AUTH_LDAP_USERNAME_FIELD_0 || 'userid',
            useridField: process.env.HD_AUTH_LDAP_USERID_FIELD_0,
            tlsCa: toArrayConfig(process.env.HD_AUTH_LDAP_TLS_CA_0, ','),
          },
          {
            providerName: process.env.HD_AUTH_LDAP_PROVIDER_NAME_1 || 'LDAP',
            url: process.env.HD_AUTH_LDAP_URL_1,
            bindDn: process.env.HD_AUTH_LDAP_BIND_DN_1,
            bindCredentials: process.env.HD_AUTH_LDAP_BIND_CREDENTIALS_1,
            searchBase: process.env.HD_AUTH_LDAP_SEARCH_BASE_1,
            searchFilter:
              process.env.HD_AUTH_LDAP_SEARCH_FILTER_1 || '(uid={{username}})',
            searchAttributes: toArrayConfig(
              process.env.HD_AUTH_LDAP_SEARCH_ATTRIBUTES_1,
              ',',
            ),
            usernameField:
              process.env.HD_AUTH_LDAP_USERNAME_FIELD_1 || 'userid',
            useridField: process.env.HD_AUTH_LDAP_USERID_FIELD_1,
            tlsCa: toArrayConfig(process.env.HD_AUTH_LDAP_TLS_CA_1, ','),
          },
          {
            providerName: process.env.HD_AUTH_LDAP_PROVIDER_NAME_2 || 'LDAP',
            url: process.env.HD_AUTH_LDAP_URL_2,
            bindDn: process.env.HD_AUTH_LDAP_BIND_DN_2,
            bindCredentials: process.env.HD_AUTH_LDAP_BIND_CREDENTIALS_2,
            searchBase: process.env.HD_AUTH_LDAP_SEARCH_BASE_2,
            searchFilter:
              process.env.HD_AUTH_LDAP_SEARCH_FILTER_2 || '(uid={{username}})',
            searchAttributes: toArrayConfig(
              process.env.HD_AUTH_LDAP_SEARCH_ATTRIBUTES_2,
              ',',
            ),
            usernameField:
              process.env.HD_AUTH_LDAP_USERNAME_FIELD_2 || 'userid',
            useridField: process.env.HD_AUTH_LDAP_USERID_FIELD_2,
            tlsCa: toArrayConfig(process.env.HD_AUTH_LDAP_TLS_CA_2, ','),
          },
          {
            providerName: process.env.HD_AUTH_LDAP_PROVIDER_NAME_3 || 'LDAP',
            url: process.env.HD_AUTH_LDAP_URL_3,
            bindDn: process.env.HD_AUTH_LDAP_BIND_DN_3,
            bindCredentials: process.env.HD_AUTH_LDAP_BIND_CREDENTIALS_3,
            searchBase: process.env.HD_AUTH_LDAP_SEARCH_BASE_3,
            searchFilter:
              process.env.HD_AUTH_LDAP_SEARCH_FILTER_3 || '(uid={{username}})',
            searchAttributes: toArrayConfig(
              process.env.HD_AUTH_LDAP_SEARCH_ATTRIBUTES_3,
              ',',
            ),
            usernameField:
              process.env.HD_AUTH_LDAP_USERNAME_FIELD_3 || 'userid',
            useridField: process.env.HD_AUTH_LDAP_USERID_FIELD_3,
            tlsCa: toArrayConfig(process.env.HD_AUTH_LDAP_TLS_CA_3, ','),
          },
          {
            providerName: process.env.HD_AUTH_LDAP_PROVIDER_NAME_4 || 'LDAP',
            url: process.env.HD_AUTH_LDAP_URL_4,
            bindDn: process.env.HD_AUTH_LDAP_BIND_DN_4,
            bindCredentials: process.env.HD_AUTH_LDAP_BIND_CREDENTIALS_4,
            searchBase: process.env.HD_AUTH_LDAP_SEARCH_BASE_4,
            searchFilter:
              process.env.HD_AUTH_LDAP_SEARCH_FILTER_4 || '(uid={{username}})',
            searchAttributes: toArrayConfig(
              process.env.HD_AUTH_LDAP_SEARCH_ATTRIBUTES_4,
              ',',
            ),
            usernameField:
              process.env.HD_AUTH_LDAP_USERNAME_FIELD_4 || 'userid',
            useridField: process.env.HD_AUTH_LDAP_USERID_FIELD_4,
            tlsCa: toArrayConfig(process.env.HD_AUTH_LDAP_TLS_CA_4, ','),
          },
        ],
        saml: [
          {
            providerName: process.env.HD_AUTH_SAML_PROVIDER_NAME_0 || 'SAML',
            idpSsoUrl: process.env.HD_AUTH_SAML_IDPSSOURL_0,
            idpCert: process.env.HD_AUTH_SAML_IDPCERT_0,
            clientCert: process.env.HD_AUTH_SAML_CLIENTCERT_0,
            issuer: process.env.HD_AUTH_SAML_ISSUER_0,
            identifierFormat:
              process.env.HD_AUTH_SAML_IDENTIFIERFORMAT_0 ||
              'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
            disableRequestedAuthnContext:
              process.env.HD_AUTH_SAML_DISABLEREQUESTEDAUTHNCONTEXT_0 || false,
            groupAttribute: process.env.HD_AUTH_SAML_GROUPATTRIBUTE_0,
            requiredGroups: toArrayConfig(
              process.env.HD_AUTH_SAML_REQUIREDGROUPS_0,
              '|',
            ),
            externalGroups: toArrayConfig(
              process.env.HD_AUTH_SAML_EXTERNALGROUPS_0,
              '|',
            ),
            attribute: {
              id: process.env.HD_AUTH_SAML_ATTRIBUTE_ID_0 || 'NameId',
              username:
                process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_0 || 'NameId',
              email: process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_0 || 'NameId',
            },
          },
          {
            providerName: process.env.HD_AUTH_SAML_PROVIDER_NAME_1 || 'SAML',
            idpSsoUrl: process.env.HD_AUTH_SAML_IDPSSOURL_1,
            idpCert: process.env.HD_AUTH_SAML_IDPCERT_1,
            clientCert: process.env.HD_AUTH_SAML_CLIENTCERT_1,
            issuer: process.env.HD_AUTH_SAML_ISSUER_1,
            identifierFormat:
              process.env.HD_AUTH_SAML_IDENTIFIERFORMAT_1 ||
              'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
            disableRequestedAuthnContext:
              process.env.HD_AUTH_SAML_DISABLEREQUESTEDAUTHNCONTEXT_1 || false,
            groupAttribute: process.env.HD_AUTH_SAML_GROUPATTRIBUTE_1,
            requiredGroups: toArrayConfig(
              process.env.HD_AUTH_SAML_REQUIREDGROUPS_1,
              '|',
            ),
            externalGroups: toArrayConfig(
              process.env.HD_AUTH_SAML_EXTERNALGROUPS_1,
              '|',
            ),
            attribute: {
              id: process.env.HD_AUTH_SAML_ATTRIBUTE_ID_1 || 'NameId',
              username:
                process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_1 || 'NameId',
              email: process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_1 || 'NameId',
            },
          },
          {
            providerName: process.env.HD_AUTH_SAML_PROVIDER_NAME_2 || 'SAML',
            idpSsoUrl: process.env.HD_AUTH_SAML_IDPSSOURL_2,
            idpCert: process.env.HD_AUTH_SAML_IDPCERT_2,
            clientCert: process.env.HD_AUTH_SAML_CLIENTCERT_2,
            issuer: process.env.HD_AUTH_SAML_ISSUER_2,
            identifierFormat:
              process.env.HD_AUTH_SAML_IDENTIFIERFORMAT_2 ||
              'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
            disableRequestedAuthnContext:
              process.env.HD_AUTH_SAML_DISABLEREQUESTEDAUTHNCONTEXT_2 || false,
            groupAttribute: process.env.HD_AUTH_SAML_GROUPATTRIBUTE_2,
            requiredGroups: toArrayConfig(
              process.env.HD_AUTH_SAML_REQUIREDGROUPS_2,
              '|',
            ),
            externalGroups: toArrayConfig(
              process.env.HD_AUTH_SAML_EXTERNALGROUPS_2,
              '|',
            ),
            attribute: {
              id: process.env.HD_AUTH_SAML_ATTRIBUTE_ID_2 || 'NameId',
              username:
                process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_2 || 'NameId',
              email: process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_2 || 'NameId',
            },
          },
          {
            providerName: process.env.HD_AUTH_SAML_PROVIDER_NAME_3 || 'SAML',
            idpSsoUrl: process.env.HD_AUTH_SAML_IDPSSOURL_3,
            idpCert: process.env.HD_AUTH_SAML_IDPCERT_3,
            clientCert: process.env.HD_AUTH_SAML_CLIENTCERT_3,
            issuer: process.env.HD_AUTH_SAML_ISSUER_3,
            identifierFormat:
              process.env.HD_AUTH_SAML_IDENTIFIERFORMAT_3 ||
              'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
            disableRequestedAuthnContext:
              process.env.HD_AUTH_SAML_DISABLEREQUESTEDAUTHNCONTEXT_3 || false,
            groupAttribute: process.env.HD_AUTH_SAML_GROUPATTRIBUTE_3,
            requiredGroups: toArrayConfig(
              process.env.HD_AUTH_SAML_REQUIREDGROUPS_3,
              '|',
            ),
            externalGroups: toArrayConfig(
              process.env.HD_AUTH_SAML_EXTERNALGROUPS_3,
              '|',
            ),
            attribute: {
              id: process.env.HD_AUTH_SAML_ATTRIBUTE_ID_3 || 'NameId',
              username:
                process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_3 || 'NameId',
              email: process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_3 || 'NameId',
            },
          },
          {
            providerName: process.env.HD_AUTH_SAML_PROVIDER_NAME_4 || 'SAML',
            idpSsoUrl: process.env.HD_AUTH_SAML_IDPSSOURL_4,
            idpCert: process.env.HD_AUTH_SAML_IDPCERT_4,
            clientCert: process.env.HD_AUTH_SAML_CLIENTCERT_4,
            issuer: process.env.HD_AUTH_SAML_ISSUER_4,
            identifierFormat:
              process.env.HD_AUTH_SAML_IDENTIFIERFORMAT_4 ||
              'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
            disableRequestedAuthnContext:
              process.env.HD_AUTH_SAML_DISABLEREQUESTEDAUTHNCONTEXT_4 || false,
            groupAttribute: process.env.HD_AUTH_SAML_GROUPATTRIBUTE_4,
            requiredGroups: toArrayConfig(
              process.env.HD_AUTH_SAML_REQUIREDGROUPS_4,
              '|',
            ),
            externalGroups: toArrayConfig(
              process.env.HD_AUTH_SAML_EXTERNALGROUPS_4,
              '|',
            ),
            attribute: {
              id: process.env.HD_AUTH_SAML_ATTRIBUTE_ID_4 || 'NameId',
              username:
                process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_4 || 'NameId',
              email: process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_4 || 'NameId',
            },
          },
        ],
        oauth2: [
          {
            providerName: process.env.HD_AUTH_OAUTH2_PROVIDERNAME_0 || 'OAuth2',
            baseURL: process.env.HD_AUTH_OAUTH2_BASEURL_0,
            userProfileURL: process.env.HD_AUTH_OAUTH2_USER_PROFILE_URL_0,
            userProfileIdAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_ID_ATTR_0,
            userProfileUsernameAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_USERNAME_ATTR_0,
            userProfileDisplayNameAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_DISPLAY_NAME_ATTR_0,
            userProfileEmailAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_EMAIL_ATTR_0,
            tokenURL: process.env.HD_AUTH_OAUTH2_TOKEN_URL_0,
            authorizationURL: process.env.HD_AUTH_OAUTH2_AUTHORIZATION_URL_0,
            clientID: process.env.HD_AUTH_OAUTH2_CLIENT_ID_0,
            clientSecret: process.env.HD_AUTH_OAUTH2_CLIENT_SECRET_0,
            scope: process.env.HD_AUTH_OAUTH2_SCOPE_0,
            rolesClaim: process.env.HD_AUTH_OAUTH2_ROLES_CLAIM_0,
            accessRole: process.env.HD_AUTH_OAUTH2_ACCESS_ROLE_0,
          },
          {
            providerName: process.env.HD_AUTH_OAUTH2_PROVIDERNAME_1 || 'OAuth2',
            baseURL: process.env.HD_AUTH_OAUTH2_BASEURL_1,
            userProfileURL: process.env.HD_AUTH_OAUTH2_USER_PROFILE_URL_1,
            userProfileIdAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_ID_ATTR_1,
            userProfileUsernameAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_USERNAME_ATTR_1,
            userProfileDisplayNameAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_DISPLAY_NAME_ATTR_1,
            userProfileEmailAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_EMAIL_ATTR_1,
            tokenURL: process.env.HD_AUTH_OAUTH2_TOKEN_URL_1,
            authorizationURL: process.env.HD_AUTH_OAUTH2_AUTHORIZATION_URL_1,
            clientID: process.env.HD_AUTH_OAUTH2_CLIENT_ID_1,
            clientSecret: process.env.HD_AUTH_OAUTH2_CLIENT_SECRET_1,
            scope: process.env.HD_AUTH_OAUTH2_SCOPE_1,
            rolesClaim: process.env.HD_AUTH_OAUTH2_ROLES_CLAIM_1,
            accessRole: process.env.HD_AUTH_OAUTH2_ACCESS_ROLE_1,
          },
          {
            providerName: process.env.HD_AUTH_OAUTH2_PROVIDERNAME_2 || 'OAuth2',
            baseURL: process.env.HD_AUTH_OAUTH2_BASEURL_2,
            userProfileURL: process.env.HD_AUTH_OAUTH2_USER_PROFILE_URL_2,
            userProfileIdAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_ID_ATTR_2,
            userProfileUsernameAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_USERNAME_ATTR_2,
            userProfileDisplayNameAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_DISPLAY_NAME_ATTR_2,
            userProfileEmailAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_EMAIL_ATTR_2,
            tokenURL: process.env.HD_AUTH_OAUTH2_TOKEN_URL_2,
            authorizationURL: process.env.HD_AUTH_OAUTH2_AUTHORIZATION_URL_2,
            clientID: process.env.HD_AUTH_OAUTH2_CLIENT_ID_2,
            clientSecret: process.env.HD_AUTH_OAUTH2_CLIENT_SECRET_2,
            scope: process.env.HD_AUTH_OAUTH2_SCOPE_2,
            rolesClaim: process.env.HD_AUTH_OAUTH2_ROLES_CLAIM_2,
            accessRole: process.env.HD_AUTH_OAUTH2_ACCESS_ROLE_2,
          },
          {
            providerName: process.env.HD_AUTH_OAUTH2_PROVIDERNAME_3 || 'OAuth2',
            baseURL: process.env.HD_AUTH_OAUTH2_BASEURL_3,
            userProfileURL: process.env.HD_AUTH_OAUTH2_USER_PROFILE_URL_3,
            userProfileIdAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_ID_ATTR_3,
            userProfileUsernameAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_USERNAME_ATTR_3,
            userProfileDisplayNameAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_DISPLAY_NAME_ATTR_3,
            userProfileEmailAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_EMAIL_ATTR_3,
            tokenURL: process.env.HD_AUTH_OAUTH2_TOKEN_URL_3,
            authorizationURL: process.env.HD_AUTH_OAUTH2_AUTHORIZATION_URL_3,
            clientID: process.env.HD_AUTH_OAUTH2_CLIENT_ID_3,
            clientSecret: process.env.HD_AUTH_OAUTH2_CLIENT_SECRET_3,
            scope: process.env.HD_AUTH_OAUTH2_SCOPE_3,
            rolesClaim: process.env.HD_AUTH_OAUTH2_ROLES_CLAIM_3,
            accessRole: process.env.HD_AUTH_OAUTH2_ACCESS_ROLE_3,
          },
          {
            providerName: process.env.HD_AUTH_OAUTH2_PROVIDERNAME_4 || 'OAuth2',
            baseURL: process.env.HD_AUTH_OAUTH2_BASEURL_4,
            userProfileURL: process.env.HD_AUTH_OAUTH2_USER_PROFILE_URL_4,
            userProfileIdAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_ID_ATTR_4,
            userProfileUsernameAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_USERNAME_ATTR_4,
            userProfileDisplayNameAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_DISPLAY_NAME_ATTR_4,
            userProfileEmailAttr:
              process.env.HD_AUTH_OAUTH2_USER_PROFILE_EMAIL_ATTR_4,
            tokenURL: process.env.HD_AUTH_OAUTH2_TOKEN_URL_4,
            authorizationURL: process.env.HD_AUTH_OAUTH2_AUTHORIZATION_URL_4,
            clientID: process.env.HD_AUTH_OAUTH2_CLIENT_ID_4,
            clientSecret: process.env.HD_AUTH_OAUTH2_CLIENT_SECRET_4,
            scope: process.env.HD_AUTH_OAUTH2_SCOPE_4,
            rolesClaim: process.env.HD_AUTH_OAUTH2_ROLES_CLAIM_4,
            accessRole: process.env.HD_AUTH_OAUTH2_ACCESS_ROLE_4,
          },
        ],
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
