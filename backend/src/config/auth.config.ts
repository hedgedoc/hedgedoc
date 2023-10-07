/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import * as fs from 'fs';
import * as Joi from 'joi';

import { GitlabScope} from './gitlab.enum';
import {
  buildErrorMessage,
  ensureNoDuplicatesExist,
  parseOptionalNumber,
  replaceAuthErrorsWithEnvironmentVariables,
  toArrayConfig,
} from './utils';

export interface LDAPConfig {
  identifier: string;
  providerName: string;
  url: string;
  bindDn?: string;
  bindCredentials?: string;
  searchBase: string;
  searchFilter: string;
  searchAttributes: string[];
  userIdField: string;
  displayNameField: string;
  profilePictureField: string;
  tlsCaCerts?: string[];
}

export interface AuthConfig {
  session: {
    secret: string;
    lifetime: number;
  };
  local: {
    enableLogin: boolean;
    enableRegister: boolean;
    minimalPasswordStrength: number;
  };
  github: {
    clientID: string;
    clientSecret: string;
  };
  google: {
    clientID: string;
    clientSecret: string;
    apiKey: string;
  };
  gitlab: {
    identifier: string;
    providerName: string;
    baseURL: string;
    clientID: string;
    clientSecret: string;
    scope: GitlabScope;
  }[];
  // ToDo: tlsOptions exist in config.json.example. See https://nodejs.org/api/tls.html#tls_tls_connect_options_callback
  ldap: LDAPConfig[];
  saml: {
    identifier: string;
    providerName: string;
    idpSsoUrl: string;
    idpCert: string;
    clientCert: string;
    issuer: string;
    identifierFormat: string;
    disableRequestedAuthnContext: string;
    groupAttribute: string;
    requiredGroups?: string[];
    externalGroups?: string[];
    attribute: {
      id: string;
      username: string;
      email: string;
    };
  }[];
  oauth2: {
    identifier: string;
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
  }[];
}

const authSchema = Joi.object({
  session: {
    secret: Joi.string().label('HD_SESSION_SECRET'),
    lifetime: Joi.number()
      .default(1209600000) // 14 * 24 * 60 * 60 * 1000ms = 14 days
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
  github: {
    clientID: Joi.string().optional().label('HD_AUTH_GITHUB_CLIENT_ID'),
    clientSecret: Joi.string().optional().label('HD_AUTH_GITHUB_CLIENT_SECRET'),
  },
  google: {
    clientID: Joi.string().optional().label('HD_AUTH_GOOGLE_CLIENT_ID'),
    clientSecret: Joi.string().optional().label('HD_AUTH_GOOGLE_CLIENT_SECRET'),
    apiKey: Joi.string().optional().label('HD_AUTH_GOOGLE_APP_KEY'),
  },
  gitlab: Joi.array()
    .items(
      Joi.object({
        identifier: Joi.string(),
        providerName: Joi.string().default('Gitlab').optional(),
        baseURL: Joi.string(),
        clientID: Joi.string(),
        clientSecret: Joi.string(),
        scope: Joi.string()
          .valid(...Object.values(GitlabScope))
          .default(GitlabScope.READ_USER)
          .optional(),
      }).optional(),
    )
    .optional(),
  // ToDo: should searchfilter have a default?
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
        profilePictureField: Joi.string().default('jpegPhoto').optional(),
        tlsCaCerts: Joi.array().items(Joi.string()).optional(),
      }).optional(),
    )
    .optional(),
  saml: Joi.array()
    .items(
      Joi.object({
        identifier: Joi.string(),
        providerName: Joi.string().default('SAML').optional(),
        idpSsoUrl: Joi.string(),
        idpCert: Joi.string(),
        clientCert: Joi.string().optional(),
        // ToDo: (default: config.serverURL) will be build on-the-fly in the config/index.js from domain, urlAddPort and urlPath.
        issuer: Joi.string().optional(),
        identifierFormat: Joi.string()
          .default('urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress')
          .optional(),
        disableRequestedAuthnContext: Joi.boolean().default(false).optional(),
        groupAttribute: Joi.string().optional(),
        requiredGroups: Joi.array().items(Joi.string()).optional(),
        externalGroups: Joi.array().items(Joi.string()).optional(),
        attribute: {
          id: Joi.string().default('NameId').optional(),
          username: Joi.string().default('NameId').optional(),
          local: Joi.string().default('NameId').optional(),
        },
      }).optional(),
    )
    .optional(),
  oauth2: Joi.array()
    .items(
      Joi.object({
        identifier: Joi.string(),
        providerName: Joi.string().default('OAuth2').optional(),
        baseURL: Joi.string(),
        userProfileURL: Joi.string(),
        userProfileIdAttr: Joi.string().optional(),
        userProfileUsernameAttr: Joi.string(),
        userProfileDisplayNameAttr: Joi.string(),
        userProfileEmailAttr: Joi.string(),
        tokenURL: Joi.string(),
        authorizationURL: Joi.string(),
        clientID: Joi.string(),
        clientSecret: Joi.string(),
        scope: Joi.string().optional(),
        rolesClaim: Joi.string().optional(),
        accessRole: Joi.string().optional(),
      }).optional(),
    )
    .optional(),
});

export default registerAs('authConfig', () => {
  const gitlabNames = (
    toArrayConfig(process.env.HD_AUTH_GITLABS, ',') ?? []
  ).map((name) => name.toUpperCase());
  if (gitlabNames.length !== 0) {
    throw new Error(
      "GitLab auth is currently not yet supported. Please don't configure it",
    );
  }
  ensureNoDuplicatesExist('GitLab', gitlabNames);

  const ldapNames = (
    toArrayConfig(process.env.HD_AUTH_LDAP_SERVERS, ',') ?? []
  ).map((name) => name.toUpperCase());
  ensureNoDuplicatesExist('LDAP', ldapNames);

  const samlNames = (toArrayConfig(process.env.HD_AUTH_SAMLS, ',') ?? []).map(
    (name) => name.toUpperCase(),
  );
  if (samlNames.length !== 0) {
    throw new Error(
      "SAML auth is currently not yet supported. Please don't configure it",
    );
  }
  ensureNoDuplicatesExist('SAML', samlNames);

  const oauth2Names = (
    toArrayConfig(process.env.HD_AUTH_OAUTH2S, ',') ?? []
  ).map((name) => name.toUpperCase());
  if (oauth2Names.length !== 0) {
    throw new Error(
      "OAuth2 auth is currently not yet supported. Please don't configure it",
    );
  }
  ensureNoDuplicatesExist('OAuth2', oauth2Names);

  const gitlabs = gitlabNames.map((gitlabName) => {
    return {
      identifier: gitlabName,
      providerName: process.env[`HD_AUTH_GITLAB_${gitlabName}_PROVIDER_NAME`],
      baseURL: process.env[`HD_AUTH_GITLAB_${gitlabName}_BASE_URL`],
      clientID: process.env[`HD_AUTH_GITLAB_${gitlabName}_CLIENT_ID`],
      clientSecret: process.env[`HD_AUTH_GITLAB_${gitlabName}_CLIENT_SECRET`],
      scope: process.env[`HD_AUTH_GITLAB_${gitlabName}_SCOPE`],
      version: process.env[`HD_AUTH_GITLAB_${gitlabName}_GITLAB_VERSION`],
    };
  });

  const ldaps = ldapNames.map((ldapName) => {
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
      identifier: ldapName,
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
      profilePictureField:
        process.env[`HD_AUTH_LDAP_${ldapName}_PROFILE_PICTURE_FIELD`],
      tlsCaCerts: tlsCaCerts,
    };
  });

  const samls = samlNames.map((samlName) => {
    return {
      identifier: samlName,
      providerName: process.env[`HD_AUTH_SAML_${samlName}_PROVIDER_NAME`],
      idpSsoUrl: process.env[`HD_AUTH_SAML_${samlName}_IDP_SSO_URL`],
      idpCert: process.env[`HD_AUTH_SAML_${samlName}_IDP_CERT`],
      clientCert: process.env[`HD_AUTH_SAML_${samlName}_CLIENT_CERT`],
      issuer: process.env[`HD_AUTH_SAML_${samlName}_ISSUER`],
      identifierFormat:
        process.env[`HD_AUTH_SAML_${samlName}_IDENTIFIER_FORMAT`],
      disableRequestedAuthnContext:
        process.env[`HD_AUTH_SAML_${samlName}_DISABLE_REQUESTED_AUTHN_CONTEXT`],
      groupAttribute: process.env[`HD_AUTH_SAML_${samlName}_GROUP_ATTRIBUTE`],
      requiredGroups: toArrayConfig(
        process.env[`HD_AUTH_SAML_${samlName}_REQUIRED_GROUPS`],
        '|',
      ),
      externalGroups: toArrayConfig(
        process.env[`HD_AUTH_SAML_${samlName}_EXTERNAL_GROUPS`],
        '|',
      ),
      attribute: {
        id: process.env[`HD_AUTH_SAML_${samlName}_ATTRIBUTE_ID`],
        username: process.env[`HD_AUTH_SAML_${samlName}_ATTRIBUTE_USERNAME`],
        local: process.env[`HD_AUTH_SAML_${samlName}_ATTRIBUTE_LOCAL`],
      },
    };
  });

  const oauth2s = oauth2Names.map((oauth2Name) => {
    return {
      identifier: oauth2Name,
      providerName: process.env[`HD_AUTH_OAUTH2_${oauth2Name}_PROVIDER_NAME`],
      baseURL: process.env[`HD_AUTH_OAUTH2_${oauth2Name}_BASE_URL`],
      userProfileURL:
        process.env[`HD_AUTH_OAUTH2_${oauth2Name}_USER_PROFILE_URL`],
      userProfileIdAttr:
        process.env[`HD_AUTH_OAUTH2_${oauth2Name}_USER_PROFILE_ID_ATTR`],
      userProfileUsernameAttr:
        process.env[`HD_AUTH_OAUTH2_${oauth2Name}_USER_PROFILE_USERNAME_ATTR`],
      userProfileDisplayNameAttr:
        process.env[
          `HD_AUTH_OAUTH2_${oauth2Name}_USER_PROFILE_DISPLAY_NAME_ATTR`
        ],
      userProfileEmailAttr:
        process.env[`HD_AUTH_OAUTH2_${oauth2Name}_USER_PROFILE_EMAIL_ATTR`],
      tokenURL: process.env[`HD_AUTH_OAUTH2_${oauth2Name}_TOKEN_URL`],
      authorizationURL:
        process.env[`HD_AUTH_OAUTH2_${oauth2Name}_AUTHORIZATION_URL`],
      clientID: process.env[`HD_AUTH_OAUTH2_${oauth2Name}_CLIENT_ID`],
      clientSecret: process.env[`HD_AUTH_OAUTH2_${oauth2Name}_CLIENT_SECRET`],
      scope: process.env[`HD_AUTH_OAUTH2_${oauth2Name}_SCOPE`],
      rolesClaim: process.env[`HD_AUTH_OAUTH2_${oauth2Name}`],
      accessRole: process.env[`HD_AUTH_OAUTH2_${oauth2Name}_ACCESS_ROLE`],
    };
  });

  if (
    process.env.HD_AUTH_GITHUB_CLIENT_ID !== undefined ||
    process.env.HD_AUTH_GITHUB_CLIENT_SECRET !== undefined
  ) {
    throw new Error(
      "GitHub config is currently not yet supported. Please don't configure it",
    );
  }

  if (
    process.env.HD_AUTH_GOOGLE_CLIENT_ID !== undefined ||
    process.env.HD_AUTH_GOOGLE_CLIENT_SECRET !== undefined ||
    process.env.HD_AUTH_GOOGLE_APP_KEY !== undefined
  ) {
    throw new Error(
      "Google config is currently not yet supported. Please don't configure it",
    );
  }

  const authConfig = authSchema.validate(
    {
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
      github: {
        clientID: process.env.HD_AUTH_GITHUB_CLIENT_ID,
        clientSecret: process.env.HD_AUTH_GITHUB_CLIENT_SECRET,
      },
      google: {
        clientID: process.env.HD_AUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.HD_AUTH_GOOGLE_CLIENT_SECRET,
        apiKey: process.env.HD_AUTH_GOOGLE_APP_KEY,
      },
      gitlab: gitlabs,
      ldap: ldaps,
      saml: samls,
      oauth2: oauth2s,
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
          'gitlab',
          'HD_AUTH_GITLAB_',
          gitlabNames,
        ),
      )
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
          'saml',
          'HD_AUTH_SAML_',
          samlNames,
        ),
      )
      .map((error) =>
        replaceAuthErrorsWithEnvironmentVariables(
          error,
          'oauth2',
          'HD_AUTH_OAUTH2_',
          oauth2Names,
        ),
      );
    throw new Error(buildErrorMessage(errorMessages));
  }
  return authConfig.value as AuthConfig;
});
