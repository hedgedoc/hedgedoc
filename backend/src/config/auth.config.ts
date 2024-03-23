/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import * as fs from 'fs';
import * as Joi from 'joi';

import { Theme } from './theme.enum';
import {
  buildErrorMessage,
  ensureNoDuplicatesExist,
  parseOptionalNumber,
  replaceAuthErrorsWithEnvironmentVariables,
  toArrayConfig,
} from './utils';

export interface InternalIdentifier {
  identifier: string;
  providerName: string;
}

export interface LDAPConfig extends InternalIdentifier {
  url: string;
  bindDn?: string;
  bindCredentials?: string;
  searchBase: string;
  searchFilter: string;
  searchAttributes: string[];
  userIdField: string;
  displayNameField: string;
  emailField: string;
  profilePictureField: string;
  tlsCaCerts?: string[];
}

export interface OidcConfig extends InternalIdentifier {
  issuer: string;
  clientID: string;
  clientSecret: string;
  theme?: string;
  authorizeUrl?: string;
  tokenUrl?: string;
  userinfoUrl?: string;
  scope: string;
  userNameField: string;
  userIdField: string;
  displayNameField: string;
  profilePictureField: string;
  emailField: string;
}

export interface AuthConfig {
  common: {
    allowProfileEdits: boolean;
    allowChooseUsername: boolean;
    syncSource?: string;
  };
  session: {
    secret: string;
    lifetime: number;
  };
  local: {
    enableLogin: boolean;
    enableRegister: boolean;
    minimalPasswordStrength: number;
  };
  // ToDo: tlsOptions exist in config.json.example. See https://nodejs.org/api/tls.html#tls_tls_connect_options_callback
  ldap: LDAPConfig[];
  oidc: OidcConfig[];
}

const authSchema = Joi.object({
  common: {
    allowProfileEdits: Joi.boolean()
      .default(true)
      .optional()
      .label('HD_AUTH_ALLOW_PROFILE_EDITS'),
    allowChooseUsername: Joi.boolean()
      .default(true)
      .optional()
      .label('HD_AUTH_ALLOW_CHOOSE_USERNAME'),
    syncSource: Joi.string().optional().label('HD_AUTH_SYNC_SOURCE'),
  },
  session: {
    secret: Joi.string().label('HD_SESSION_SECRET'),
    lifetime: Joi.number()
      .default(1209600) // 14 * 24 * 60 * 60s = 14 days
      .optional()
      .label('HD_SESSION_LIFETIME'),
  },
  local: {
    enableLogin: Joi.boolean()
      .default(false)
      .optional()
      .label('HD_AUTH_LOCAL_ENABLE_LOGIN'),
    enableRegister: Joi.boolean()
      .default(false)
      .optional()
      .label('HD_AUTH_LOCAL_ENABLE_REGISTER'),
    minimalPasswordStrength: Joi.number()
      .default(2)
      .min(0)
      .max(4)
      .optional()
      .label('HD_AUTH_LOCAL_MINIMAL_PASSWORD_STRENGTH'),
  },
  ldap: Joi.array()
    .items(
      Joi.object({
        identifier: Joi.string(),
        providerName: Joi.string().default('LDAP').optional(),
        url: Joi.string(),
        bindDn: Joi.string().optional(),
        bindCredentials: Joi.string().optional(),
        searchBase: Joi.string(),
        searchFilter: Joi.string().default('(uid={{username}})').optional(),
        searchAttributes: Joi.array().items(Joi.string()).optional(),
        userIdField: Joi.string().default('uid').optional(),
        displayNameField: Joi.string().default('displayName').optional(),
        emailField: Joi.string().default('mail').optional(),
        profilePictureField: Joi.string().default('jpegPhoto').optional(),
        tlsCaCerts: Joi.array().items(Joi.string()).optional(),
      }).optional(),
    )
    .optional(),
  oidc: Joi.array()
    .items(
      Joi.object({
        identifier: Joi.string(),
        providerName: Joi.string().default('OpenID Connect').optional(),
        issuer: Joi.string(),
        clientID: Joi.string(),
        clientSecret: Joi.string(),
        theme: Joi.string()
          .valid(...Object.values(Theme))
          .optional(),
        authorizeUrl: Joi.string().optional(),
        tokenUrl: Joi.string().optional(),
        userinfoUrl: Joi.string().optional(),
        scope: Joi.string().default('openid profile email').optional(),
        userIdField: Joi.string().default('sub').optional(),
        userNameField: Joi.string().default('preferred_username').optional(),
        displayNameField: Joi.string().default('name').optional(),
        profilePictureField: Joi.string().default('picture').optional(),
        emailField: Joi.string().default('email').optional(),
      }).optional(),
    )
    .optional(),
});

export default registerAs('authConfig', () => {
  const ldapNames = (
    toArrayConfig(process.env.HD_AUTH_LDAP_SERVERS, ',') ?? []
  ).map((name) => name.toUpperCase());
  ensureNoDuplicatesExist('LDAP', ldapNames);

  const oidcNames = (
    toArrayConfig(process.env.HD_AUTH_OIDC_SERVERS, ',') ?? []
  ).map((name) => name.toUpperCase());
  ensureNoDuplicatesExist('OIDC', oidcNames);

  const ldapInstances = ldapNames.map((ldapName) => {
    const caFiles = toArrayConfig(
      process.env[`HD_AUTH_LDAP_${ldapName}_TLS_CERT_PATHS`],
      ',',
    );
    let tlsCaCerts = undefined;
    if (caFiles) {
      tlsCaCerts = caFiles.map((fileName) => {
        if (fs.existsSync(fileName)) {
          return fs.readFileSync(fileName, 'utf8');
        }
      });
    }
    return {
      identifier: ldapName.toLowerCase(),
      providerName: process.env[`HD_AUTH_LDAP_${ldapName}_PROVIDER_NAME`],
      url: process.env[`HD_AUTH_LDAP_${ldapName}_URL`],
      bindDn: process.env[`HD_AUTH_LDAP_${ldapName}_BIND_DN`],
      bindCredentials: process.env[`HD_AUTH_LDAP_${ldapName}_BIND_CREDENTIALS`],
      searchBase: process.env[`HD_AUTH_LDAP_${ldapName}_SEARCH_BASE`],
      searchFilter: process.env[`HD_AUTH_LDAP_${ldapName}_SEARCH_FILTER`],
      searchAttributes: toArrayConfig(
        process.env[`HD_AUTH_LDAP_${ldapName}_SEARCH_ATTRIBUTES`],
        ',',
      ),
      userIdField: process.env[`HD_AUTH_LDAP_${ldapName}_USER_ID_FIELD`],
      displayNameField:
        process.env[`HD_AUTH_LDAP_${ldapName}_DISPLAY_NAME_FIELD`],
      emailField: process.env[`HD_AUTH_LDAP_${ldapName}_EMAIL_FIELD`],
      profilePictureField:
        process.env[`HD_AUTH_LDAP_${ldapName}_PROFILE_PICTURE_FIELD`],
      tlsCaCerts: tlsCaCerts,
    };
  });

  const oidcInstances = oidcNames.map((oidcName) => ({
    identifier: oidcName.toLowerCase(),
    providerName: process.env[`HD_AUTH_OIDC_${oidcName}_PROVIDER_NAME`],
    issuer: process.env[`HD_AUTH_OIDC_${oidcName}_ISSUER`],
    clientID: process.env[`HD_AUTH_OIDC_${oidcName}_CLIENT_ID`],
    clientSecret: process.env[`HD_AUTH_OIDC_${oidcName}_CLIENT_SECRET`],
    theme: process.env[`HD_AUTH_OIDC_${oidcName}_THEME`],
    authorizeUrl: process.env[`HD_AUTH_OIDC_${oidcName}_AUTHORIZE_URL`],
    tokenUrl: process.env[`HD_AUTH_OIDC_${oidcName}_TOKEN_URL`],
    userinfoUrl: process.env[`HD_AUTH_OIDC_${oidcName}_USERINFO_URL`],
    scope: process.env[`HD_AUTH_OIDC_${oidcName}_SCOPE`],
    userIdField: process.env[`HD_AUTH_OIDC_${oidcName}_USER_ID_FIELD`],
    userNameField: process.env[`HD_AUTH_OIDC_${oidcName}_USER_NAME_FIELD`],
    displayNameField:
      process.env[`HD_AUTH_OIDC_${oidcName}_DISPLAY_NAME_FIELD`],
    profilePictureField:
      process.env[`HD_AUTH_OIDC_${oidcName}_PROFILE_PICTURE_FIELD`],
    emailField: process.env[`HD_AUTH_OIDC_${oidcName}_EMAIL_FIELD`],
  }));

  let syncSource = process.env.HD_AUTH_SYNC_SOURCE;
  if (syncSource !== undefined) {
    syncSource = syncSource.toLowerCase();
  }

  const authConfig = authSchema.validate(
    {
      common: {
        allowProfileEdits: process.env.HD_AUTH_ALLOW_PROFILE_EDITS,
        allowChooseUsername: process.env.HD_AUTH_ALLOW_CHOOSE_USERNAME,
        syncSource: syncSource,
      },
      session: {
        secret: process.env.HD_SESSION_SECRET,
        lifetime: parseOptionalNumber(process.env.HD_SESSION_LIFETIME),
      },
      local: {
        enableLogin: process.env.HD_AUTH_LOCAL_ENABLE_LOGIN,
        enableRegister: process.env.HD_AUTH_LOCAL_ENABLE_REGISTER,
        minimalPasswordStrength: parseOptionalNumber(
          process.env.HD_AUTH_LOCAL_MINIMAL_PASSWORD_STRENGTH,
        ),
      },
      ldap: ldapInstances,
      oidc: oidcInstances,
    },
    {
      abortEarly: false,
      presence: 'required',
    },
  );
  if (authConfig.error) {
    const errorMessages = authConfig.error.details
      .map((detail) => detail.message)
      .map((error) =>
        replaceAuthErrorsWithEnvironmentVariables(
          error,
          'ldap',
          'HD_AUTH_LDAP_',
          ldapNames,
        ),
      )
      .map((error) =>
        replaceAuthErrorsWithEnvironmentVariables(
          error,
          'oidc',
          'HD_AUTH_OIDC_',
          oidcNames,
        ),
      );
    throw new Error(buildErrorMessage(errorMessages));
  }
  return authConfig.value as AuthConfig;
});
