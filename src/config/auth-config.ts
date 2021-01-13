/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Joi from 'joi';
import { GitlabScope, GitlabVersion } from './gitlab.enum';
import { toArrayConfig } from './utils';

export interface AuthConfig {
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
}

export const authSchema = Joi.object({
  email: {
    enableLogin: Joi.boolean().default(false).optional(),
    enableRegister: Joi.boolean().default(false).optional(),
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
        providerName: Joi.string().default('Gitlab').optional(),
        baseURL: Joi.string().optional(),
        clientID: Joi.string().optional(),
        clientSecret: Joi.string().optional(),
        scope: Joi.string()
          .valid(...Object.values(GitlabScope))
          .default(GitlabScope.READ_USER)
          .optional(),
        version: Joi.string()
          .valid(...Object.values(GitlabVersion))
          .default(GitlabVersion.V4)
          .optional(),
      }),
    )
    .optional(),
  // ToDo: should searchfilter have a default?
  ldap: Joi.array()
    .items(
      Joi.object({
        providerName: Joi.string().default('LDAP').optional(),
        url: Joi.string().optional(),
        bindDn: Joi.string().optional(),
        bindCredentials: Joi.string().optional(),
        searchBase: Joi.string().optional(),
        searchFilter: Joi.string().default('(uid={{username}})').optional(),
        searchAttributes: Joi.array().items(Joi.string()),
        usernameField: Joi.string().default('userid').optional(),
        useridField: Joi.string().optional(),
        tlsCa: Joi.array().items(Joi.string()),
      }),
    )
    .optional(),
  saml: Joi.array()
    .items(
      Joi.object({
        providerName: Joi.string().default('SAML').optional(),
        idpSsoUrl: Joi.string().optional(),
        idpCert: Joi.string().optional(),
        clientCert: Joi.string().optional(),
        // ToDo: (default: config.serverURL) will be build on-the-fly in the config/index.js from domain, urlAddPort and urlPath.
        issuer: Joi.string().optional(), //.default().optional(),
        identifierFormat: Joi.string()
          .default('urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress')
          .optional(),
        disableRequestedAuthnContext: Joi.boolean().default(false).optional(),
        groupAttribute: Joi.string().optional(),
        requiredGroups: Joi.array().items(Joi.string()),
        externalGroups: Joi.array().items(Joi.string()),
        attribute: {
          id: Joi.string().default('NameId').optional(),
          username: Joi.string().default('NameId').optional(),
          email: Joi.string().default('NameId').optional(),
        },
      }),
    )
    .optional(),
  oauth2: Joi.array()
    .items(
      Joi.object({
        providerName: Joi.string().default('OAuth2').optional(),
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
});

// ToDo: Validate these with Joi to prevent duplicate entries?

const gitlabNames = toArrayConfig(process.env.HD_AUTH_GITLABS, ',');
const ldapNames = toArrayConfig(process.env.HD_AUTH_LDAPS, ',');
const samlNames = toArrayConfig(process.env.HD_AUTH_SAMLS, ',');
const oauth2Names = toArrayConfig(process.env.HD_AUTH_OAUTH2S, ',');

const gitlabs = gitlabNames.map((gitlabName) => {
  return {
    providerName: process.env[`HD_AUTH_GITLAB_${gitlabName}_PROVIDER_NAME`],
    baseURL: process.env[`HD_AUTH_GITLAB_${gitlabName}_BASE_URL`],
    clientID: process.env[`HD_AUTH_GITLAB_${gitlabName}_CLIENT_ID`],
    clientSecret: process.env[`HD_AUTH_GITLAB_${gitlabName}_CLIENT_SECRET`],
    scope: process.env[`HD_AUTH_GITLAB_${gitlabName}_GITLAB_SCOPE`],
    version: process.env[`HD_AUTH_GITLAB_${gitlabName}_GITLAB_VERSION`],
  };
});

const ldaps = ldapNames.map((ldapName) => {
  return {
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
    usernameField: process.env[`HD_AUTH_LDAP_${ldapName}_USERNAME_FIELD`],
    useridField: process.env[`HD_AUTH_LDAP_${ldapName}_USERID_FIELD`],
    tlsCa: toArrayConfig(process.env[`HD_AUTH_LDAP_${ldapName}_TLS_CA`], ','),
  };
});

const samls = samlNames.map((samlName) => {
  return {
    providerName: process.env[`HD_AUTH_SAML_${samlName}_PROVIDER_NAME`],
    idpSsoUrl: process.env[`HD_AUTH_SAML_${samlName}_IDPSSOURL`],
    idpCert: process.env[`HD_AUTH_SAML_${samlName}_IDPCERT`],
    clientCert: process.env[`HD_AUTH_SAML_${samlName}_CLIENTCERT`],
    issuer: process.env[`HD_AUTH_SAML_${samlName}_ISSUER`],
    identifierFormat: process.env[`HD_AUTH_SAML_${samlName}_IDENTIFIERFORMAT`],
    disableRequestedAuthnContext:
      process.env[`HD_AUTH_SAML_${samlName}_DISABLEREQUESTEDAUTHNCONTEXT`],
    groupAttribute: process.env[`HD_AUTH_SAML_${samlName}_GROUPATTRIBUTE`],
    requiredGroups: toArrayConfig(
      process.env[`HD_AUTH_SAML_${samlName}_REQUIREDGROUPS`],
      '|',
    ),
    externalGroups: toArrayConfig(
      process.env[`HD_AUTH_SAML_${samlName}_EXTERNALGROUPS`],
      '|',
    ),
    attribute: {
      id: process.env[`HD_AUTH_SAML_${samlName}_ATTRIBUTE_ID`],
      username: process.env[`HD_AUTH_SAML_${samlName}_ATTRIBUTE_USERNAME`],
      email: process.env[`HD_AUTH_SAML_${samlName}_ATTRIBUTE_USERNAME`],
    },
  };
});

const oauth2s = oauth2Names.map((oauth2Name) => {
  return {
    providerName: process.env[`HD_AUTH_OAUTH2_${oauth2Name}_PROVIDER_NAME`],
    baseURL: process.env[`HD_AUTH_OAUTH2_${oauth2Name}_BASEURL`],
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
    rolesClaim: process.env[`HD_AUTH_OAUTH2_${oauth2Name}_ROLES_CLAIM`],
    accessRole: process.env[`HD_AUTH_OAUTH2_${oauth2Name}_ACCESS_ROLE`],
  };
});

export const appConfigAuth = {
  email: {
    enableLogin: process.env.HD_AUTH_EMAIL_ENABLE_LOGIN,
    enableRegister: process.env.HD_AUTH_EMAIL_ENABLE_REGISTER,
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
  gitlab: gitlabs,
  ldap: ldaps,
  saml: samls,
  oauth2: oauth2s,
};
