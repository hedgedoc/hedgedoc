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
  gitlab: [
    {
      providerName: process.env.HD_AUTH_GITLAB_PROVIDER_NAME_0,
      baseURL: process.env.HD_AUTH_GITLAB_BASE_URL_0,
      clientID: process.env.HD_AUTH_GITLAB_CLIENT_ID_0,
      clientSecret: process.env.HD_AUTH_GITLAB_CLIENT_SECRET_0,
      scope: process.env.HD_AUTH_GITLAB_SCOPE_0,
      version: process.env.HD_AUTH_GITLAB_VERSION_0,
    },
    {
      providerName: process.env.HD_AUTH_GITLAB_PROVIDER_NAME_1,
      baseURL: process.env.HD_AUTH_GITLAB_BASE_URL_1,
      clientID: process.env.HD_AUTH_GITLAB_CLIENT_ID_1,
      clientSecret: process.env.HD_AUTH_GITLAB_CLIENT_SECRET_1,
      scope: process.env.HD_AUTH_GITLAB_SCOPE_1,
      version: process.env.HD_AUTH_GITLAB_VERSION_1,
    },
    {
      providerName: process.env.HD_AUTH_GITLAB_PROVIDER_NAME_2,
      baseURL: process.env.HD_AUTH_GITLAB_BASE_URL_2,
      clientID: process.env.HD_AUTH_GITLAB_CLIENT_ID_2,
      clientSecret: process.env.HD_AUTH_GITLAB_CLIENT_SECRET_2,
      scope: process.env.HD_AUTH_GITLAB_SCOPE_2,
      version: process.env.HD_AUTH_GITLAB_VERSION_2,
    },
    {
      providerName: process.env.HD_AUTH_GITLAB_PROVIDER_NAME_3,
      baseURL: process.env.HD_AUTH_GITLAB_BASE_URL_3,
      clientID: process.env.HD_AUTH_GITLAB_CLIENT_ID_3,
      clientSecret: process.env.HD_AUTH_GITLAB_CLIENT_SECRET_3,
      scope: process.env.HD_AUTH_GITLAB_SCOPE_3,
      version: process.env.HD_AUTH_GITLAB_VERSION_3,
    },
    {
      providerName: process.env.HD_AUTH_GITLAB_PROVIDER_NAME_4,
      baseURL: process.env.HD_AUTH_GITLAB_BASE_URL_4,
      clientID: process.env.HD_AUTH_GITLAB_CLIENT_ID_4,
      clientSecret: process.env.HD_AUTH_GITLAB_CLIENT_SECRET_4,
      scope: process.env.HD_AUTH_GITLAB_SCOPE_4,
      version: process.env.HD_AUTH_GITLAB_VERSION_4,
    },
  ],
  ldap: [
    {
      providerName: process.env.HD_AUTH_LDAP_PROVIDER_NAME_0,
      url: process.env.HD_AUTH_LDAP_URL_0,
      bindDn: process.env.HD_AUTH_LDAP_BIND_DN_0,
      bindCredentials: process.env.HD_AUTH_LDAP_BIND_CREDENTIALS_0,
      searchBase: process.env.HD_AUTH_LDAP_SEARCH_BASE_0,
      searchFilter: process.env.HD_AUTH_LDAP_SEARCH_FILTER_0,
      searchAttributes: toArrayConfig(
        process.env.HD_AUTH_LDAP_SEARCH_ATTRIBUTES_0,
        ',',
      ),
      usernameField: process.env.HD_AUTH_LDAP_USERNAME_FIELD_0,
      useridField: process.env.HD_AUTH_LDAP_USERID_FIELD_0,
      tlsCa: toArrayConfig(process.env.HD_AUTH_LDAP_TLS_CA_0, ','),
    },
    {
      providerName: process.env.HD_AUTH_LDAP_PROVIDER_NAME_1,
      url: process.env.HD_AUTH_LDAP_URL_1,
      bindDn: process.env.HD_AUTH_LDAP_BIND_DN_1,
      bindCredentials: process.env.HD_AUTH_LDAP_BIND_CREDENTIALS_1,
      searchBase: process.env.HD_AUTH_LDAP_SEARCH_BASE_1,
      searchFilter: process.env.HD_AUTH_LDAP_SEARCH_FILTER_1,
      searchAttributes: toArrayConfig(
        process.env.HD_AUTH_LDAP_SEARCH_ATTRIBUTES_1,
        ',',
      ),
      usernameField: process.env.HD_AUTH_LDAP_USERNAME_FIELD_1,
      useridField: process.env.HD_AUTH_LDAP_USERID_FIELD_1,
      tlsCa: toArrayConfig(process.env.HD_AUTH_LDAP_TLS_CA_1, ','),
    },
    {
      providerName: process.env.HD_AUTH_LDAP_PROVIDER_NAME_2,
      url: process.env.HD_AUTH_LDAP_URL_2,
      bindDn: process.env.HD_AUTH_LDAP_BIND_DN_2,
      bindCredentials: process.env.HD_AUTH_LDAP_BIND_CREDENTIALS_2,
      searchBase: process.env.HD_AUTH_LDAP_SEARCH_BASE_2,
      searchFilter: process.env.HD_AUTH_LDAP_SEARCH_FILTER_2,
      searchAttributes: toArrayConfig(
        process.env.HD_AUTH_LDAP_SEARCH_ATTRIBUTES_2,
        ',',
      ),
      usernameField: process.env.HD_AUTH_LDAP_USERNAME_FIELD_2,
      useridField: process.env.HD_AUTH_LDAP_USERID_FIELD_2,
      tlsCa: toArrayConfig(process.env.HD_AUTH_LDAP_TLS_CA_2, ','),
    },
    {
      providerName: process.env.HD_AUTH_LDAP_PROVIDER_NAME_3,
      url: process.env.HD_AUTH_LDAP_URL_3,
      bindDn: process.env.HD_AUTH_LDAP_BIND_DN_3,
      bindCredentials: process.env.HD_AUTH_LDAP_BIND_CREDENTIALS_3,
      searchBase: process.env.HD_AUTH_LDAP_SEARCH_BASE_3,
      searchFilter: process.env.HD_AUTH_LDAP_SEARCH_FILTER_3,
      searchAttributes: toArrayConfig(
        process.env.HD_AUTH_LDAP_SEARCH_ATTRIBUTES_3,
        ',',
      ),
      usernameField: process.env.HD_AUTH_LDAP_USERNAME_FIELD_3,
      useridField: process.env.HD_AUTH_LDAP_USERID_FIELD_3,
      tlsCa: toArrayConfig(process.env.HD_AUTH_LDAP_TLS_CA_3, ','),
    },
    {
      providerName: process.env.HD_AUTH_LDAP_PROVIDER_NAME_4,
      url: process.env.HD_AUTH_LDAP_URL_4,
      bindDn: process.env.HD_AUTH_LDAP_BIND_DN_4,
      bindCredentials: process.env.HD_AUTH_LDAP_BIND_CREDENTIALS_4,
      searchBase: process.env.HD_AUTH_LDAP_SEARCH_BASE_4,
      searchFilter: process.env.HD_AUTH_LDAP_SEARCH_FILTER_4,
      searchAttributes: toArrayConfig(
        process.env.HD_AUTH_LDAP_SEARCH_ATTRIBUTES_4,
        ',',
      ),
      usernameField: process.env.HD_AUTH_LDAP_USERNAME_FIELD_4,
      useridField: process.env.HD_AUTH_LDAP_USERID_FIELD_4,
      tlsCa: toArrayConfig(process.env.HD_AUTH_LDAP_TLS_CA_4, ','),
    },
  ],
  saml: [
    {
      providerName: process.env.HD_AUTH_SAML_PROVIDER_NAME_0,
      idpSsoUrl: process.env.HD_AUTH_SAML_IDPSSOURL_0,
      idpCert: process.env.HD_AUTH_SAML_IDPCERT_0,
      clientCert: process.env.HD_AUTH_SAML_CLIENTCERT_0,
      issuer: process.env.HD_AUTH_SAML_ISSUER_0,
      identifierFormat: process.env.HD_AUTH_SAML_IDENTIFIERFORMAT_0,
      disableRequestedAuthnContext:
      process.env.HD_AUTH_SAML_DISABLEREQUESTEDAUTHNCONTEXT_0,
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
        id: process.env.HD_AUTH_SAML_ATTRIBUTE_ID_0,
        username: process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_0,
        email: process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_0,
      },
    },
    {
      providerName: process.env.HD_AUTH_SAML_PROVIDER_NAME_1,
      idpSsoUrl: process.env.HD_AUTH_SAML_IDPSSOURL_1,
      idpCert: process.env.HD_AUTH_SAML_IDPCERT_1,
      clientCert: process.env.HD_AUTH_SAML_CLIENTCERT_1,
      issuer: process.env.HD_AUTH_SAML_ISSUER_1,
      identifierFormat: process.env.HD_AUTH_SAML_IDENTIFIERFORMAT_1,
      disableRequestedAuthnContext:
      process.env.HD_AUTH_SAML_DISABLEREQUESTEDAUTHNCONTEXT_1,
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
        id: process.env.HD_AUTH_SAML_ATTRIBUTE_ID_1,
        username: process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_1,
        email: process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_1,
      },
    },
    {
      providerName: process.env.HD_AUTH_SAML_PROVIDER_NAME_2,
      idpSsoUrl: process.env.HD_AUTH_SAML_IDPSSOURL_2,
      idpCert: process.env.HD_AUTH_SAML_IDPCERT_2,
      clientCert: process.env.HD_AUTH_SAML_CLIENTCERT_2,
      issuer: process.env.HD_AUTH_SAML_ISSUER_2,
      identifierFormat: process.env.HD_AUTH_SAML_IDENTIFIERFORMAT_2,
      disableRequestedAuthnContext:
      process.env.HD_AUTH_SAML_DISABLEREQUESTEDAUTHNCONTEXT_2,
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
        id: process.env.HD_AUTH_SAML_ATTRIBUTE_ID_2,
        username: process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_2,
        email: process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_2,
      },
    },
    {
      providerName: process.env.HD_AUTH_SAML_PROVIDER_NAME_3,
      idpSsoUrl: process.env.HD_AUTH_SAML_IDPSSOURL_3,
      idpCert: process.env.HD_AUTH_SAML_IDPCERT_3,
      clientCert: process.env.HD_AUTH_SAML_CLIENTCERT_3,
      issuer: process.env.HD_AUTH_SAML_ISSUER_3,
      identifierFormat: process.env.HD_AUTH_SAML_IDENTIFIERFORMAT_3,
      disableRequestedAuthnContext:
      process.env.HD_AUTH_SAML_DISABLEREQUESTEDAUTHNCONTEXT_3,
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
        id: process.env.HD_AUTH_SAML_ATTRIBUTE_ID_3,
        username: process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_3,
        email: process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_3,
      },
    },
    {
      providerName: process.env.HD_AUTH_SAML_PROVIDER_NAME_4,
      idpSsoUrl: process.env.HD_AUTH_SAML_IDPSSOURL_4,
      idpCert: process.env.HD_AUTH_SAML_IDPCERT_4,
      clientCert: process.env.HD_AUTH_SAML_CLIENTCERT_4,
      issuer: process.env.HD_AUTH_SAML_ISSUER_4,
      identifierFormat: process.env.HD_AUTH_SAML_IDENTIFIERFORMAT_4,
      disableRequestedAuthnContext:
      process.env.HD_AUTH_SAML_DISABLEREQUESTEDAUTHNCONTEXT_4,
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
        id: process.env.HD_AUTH_SAML_ATTRIBUTE_ID_4,
        username: process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_4,
        email: process.env.HD_AUTH_SAML_ATTRIBUTE_USERNAME_4,
      },
    },
  ],
  oauth2: [
    {
      providerName: process.env.HD_AUTH_OAUTH2_PROVIDERNAME_0,
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
      providerName: process.env.HD_AUTH_OAUTH2_PROVIDERNAME_1,
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
      providerName: process.env.HD_AUTH_OAUTH2_PROVIDERNAME_2,
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
      providerName: process.env.HD_AUTH_OAUTH2_PROVIDERNAME_3,
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
      providerName: process.env.HD_AUTH_OAUTH2_PROVIDERNAME_4,
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
};
