/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import mockedEnv from 'mocked-env';

import authConfig from './auth.config';
import { Theme } from './theme.enum';

describe('authConfig', () => {
  const secret = 'this-is-a-secret';
  const neededAuthConfig = {
    /* eslint-disable @typescript-eslint/naming-convention */
    HD_SESSION_SECRET: secret,
    /* eslint-enable @typescript-eslint/naming-convention */
  };

  describe('local', () => {
    const enableLogin = true;
    const enableRegister = true;
    const minimalPasswordStrength = 1;
    const completeLocalConfig = {
      /* eslint-disable @typescript-eslint/naming-convention */
      HD_AUTH_LOCAL_ENABLE_LOGIN: String(enableLogin),
      HD_AUTH_LOCAL_ENABLE_REGISTER: String(enableRegister),
      HD_AUTH_LOCAL_MINIMAL_PASSWORD_STRENGTH: String(minimalPasswordStrength),
      /* eslint-enable @typescript-eslint/naming-convention */
    };
    describe('is correctly parsed', () => {
      it('when given correct and complete environment variables', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLocalConfig,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.local.enableLogin).toEqual(enableLogin);
        expect(config.local.enableRegister).toEqual(enableRegister);
        expect(config.local.minimalPasswordStrength).toEqual(
          minimalPasswordStrength,
        );
        restore();
      });

      it('when HD_AUTH_LOCAL_ENABLE_LOGIN is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLocalConfig,
            HD_AUTH_LOCAL_ENABLE_LOGIN: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.local.enableLogin).toEqual(false);
        expect(config.local.enableRegister).toEqual(enableRegister);
        expect(config.local.minimalPasswordStrength).toEqual(
          minimalPasswordStrength,
        );
        restore();
      });

      it('when HD_AUTH_LOCAL_ENABLE_REGISTER is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLocalConfig,
            HD_AUTH_LOCAL_ENABLE_REGISTER: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.local.enableLogin).toEqual(enableLogin);
        expect(config.local.enableRegister).toEqual(false);
        expect(config.local.minimalPasswordStrength).toEqual(
          minimalPasswordStrength,
        );
        restore();
      });

      it('when HD_AUTH_LOCAL_MINIMAL_PASSWORD_STRENGTH is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLocalConfig,
            HD_AUTH_LOCAL_MINIMAL_PASSWORD_STRENGTH: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.local.enableLogin).toEqual(enableLogin);
        expect(config.local.enableRegister).toEqual(enableRegister);
        expect(config.local.minimalPasswordStrength).toEqual(2);
        restore();
      });
    });

    describe('fails to be parsed', () => {
      it('when HD_AUTH_LOCAL_MINIMAL_PASSWORD_STRENGTH is 5', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLocalConfig,
            HD_AUTH_LOCAL_MINIMAL_PASSWORD_STRENGTH: '5',
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => authConfig()).toThrow(
          'HD_AUTH_LOCAL_MINIMAL_PASSWORD_STRENGTH: Number must be less than or equal to 4',
        );
        restore();
      });
      it('when HD_AUTH_LOCAL_MINIMAL_PASSWORD_STRENGTH is -1', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLocalConfig,
            HD_AUTH_LOCAL_MINIMAL_PASSWORD_STRENGTH: '-1',
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => authConfig()).toThrow(
          'HD_AUTH_LOCAL_MINIMAL_PASSWORD_STRENGTH: Number must be greater than or equal to 0',
        );
        restore();
      });
    });
  });

  describe('ldap', () => {
    const ldapNames = ['futurama'];
    const providerName = 'Futurama LDAP';
    const url = 'ldap://localhost:389';
    const searchBase = 'ou=people,dc=planetexpress,dc=com';
    const searchFilter = '(mail={{username}})';
    const searchAttributes = ['mail', 'uid'];
    const userIdField = 'non_default_uid';
    const displayNameField = 'non_default_display_name';
    const emailField = 'non_default_email';
    const profilePictureField = 'non_default_profile_picture';
    const bindDn = 'cn=admin,dc=planetexpress,dc=com';
    const bindCredentials = 'GoodNewsEveryone';
    const tlsCa = ['./test/private-api/fixtures/hedgedoc.pem'];
    const tlsCaContent = ['test-cert\n'];
    const completeLdapConfig = {
      /* eslint-disable @typescript-eslint/naming-convention */
      HD_AUTH_LDAP_SERVERS: ldapNames.join(','),
      HD_AUTH_LDAP_FUTURAMA_PROVIDER_NAME: providerName,
      HD_AUTH_LDAP_FUTURAMA_URL: url,
      HD_AUTH_LDAP_FUTURAMA_SEARCH_BASE: searchBase,
      HD_AUTH_LDAP_FUTURAMA_SEARCH_FILTER: searchFilter,
      HD_AUTH_LDAP_FUTURAMA_SEARCH_ATTRIBUTES: searchAttributes.join(','),
      HD_AUTH_LDAP_FUTURAMA_USER_ID_FIELD: userIdField,
      HD_AUTH_LDAP_FUTURAMA_EMAIL_FIELD: emailField,
      HD_AUTH_LDAP_FUTURAMA_DISPLAY_NAME_FIELD: displayNameField,
      HD_AUTH_LDAP_FUTURAMA_PROFILE_PICTURE_FIELD: profilePictureField,
      HD_AUTH_LDAP_FUTURAMA_BIND_DN: bindDn,
      HD_AUTH_LDAP_FUTURAMA_BIND_CREDENTIALS: bindCredentials,
      HD_AUTH_LDAP_FUTURAMA_TLS_CERT_PATHS: tlsCa.join(','),
      /* eslint-enable @typescript-eslint/naming-convention */
    };
    describe('is correctly parsed', () => {
      it('when given correct and complete environment variables', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLdapConfig,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.ldap).toBeDefined();
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0]);
        expect(firstLdap.url).toEqual(url);
        expect(firstLdap.providerName).toEqual(providerName);
        expect(firstLdap.searchBase).toEqual(searchBase);
        expect(firstLdap.searchFilter).toEqual(searchFilter);
        expect(firstLdap.searchAttributes).toEqual(searchAttributes);
        expect(firstLdap.userIdField).toEqual(userIdField);
        expect(firstLdap.displayNameField).toEqual(displayNameField);
        expect(firstLdap.emailField).toEqual(emailField);
        expect(firstLdap.profilePictureField).toEqual(profilePictureField);
        expect(firstLdap.bindDn).toEqual(bindDn);
        expect(firstLdap.bindCredentials).toEqual(bindCredentials);
        expect(firstLdap.tlsCaCerts).toEqual(tlsCaContent);
        restore();
      });

      it('when no HD_AUTH_LDAP_FUTURAMA_PROVIDER_NAME is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLdapConfig,
            HD_AUTH_LDAP_FUTURAMA_PROVIDER_NAME: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.ldap).toBeDefined();
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0]);
        expect(firstLdap.url).toEqual(url);
        expect(firstLdap.providerName).toEqual('LDAP');
        expect(firstLdap.searchBase).toEqual(searchBase);
        expect(firstLdap.searchFilter).toEqual(searchFilter);
        expect(firstLdap.searchAttributes).toEqual(searchAttributes);
        expect(firstLdap.userIdField).toEqual(userIdField);
        expect(firstLdap.displayNameField).toEqual(displayNameField);
        expect(firstLdap.profilePictureField).toEqual(profilePictureField);
        expect(firstLdap.bindDn).toEqual(bindDn);
        expect(firstLdap.bindCredentials).toEqual(bindCredentials);
        expect(firstLdap.tlsCaCerts).toEqual(tlsCaContent);
        restore();
      });

      it('when no HD_AUTH_LDAP_FUTURAMA_SEARCH_FILTER is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLdapConfig,
            HD_AUTH_LDAP_FUTURAMA_SEARCH_FILTER: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.ldap).toBeDefined();
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0]);
        expect(firstLdap.url).toEqual(url);
        expect(firstLdap.providerName).toEqual(providerName);
        expect(firstLdap.searchBase).toEqual(searchBase);
        expect(firstLdap.searchFilter).toEqual('(uid={{username}})');
        expect(firstLdap.searchAttributes).toEqual(searchAttributes);
        expect(firstLdap.userIdField).toEqual(userIdField);
        expect(firstLdap.displayNameField).toEqual(displayNameField);
        expect(firstLdap.profilePictureField).toEqual(profilePictureField);
        expect(firstLdap.bindDn).toEqual(bindDn);
        expect(firstLdap.bindCredentials).toEqual(bindCredentials);
        expect(firstLdap.tlsCaCerts).toEqual(tlsCaContent);
        restore();
      });

      it('when no HD_AUTH_LDAP_FUTURAMA_USER_ID_FIELD is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLdapConfig,
            HD_AUTH_LDAP_FUTURAMA_USER_ID_FIELD: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.ldap).toBeDefined();
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0]);
        expect(firstLdap.url).toEqual(url);
        expect(firstLdap.providerName).toEqual(providerName);
        expect(firstLdap.searchBase).toEqual(searchBase);
        expect(firstLdap.searchFilter).toEqual(searchFilter);
        expect(firstLdap.searchAttributes).toEqual(searchAttributes);
        expect(firstLdap.userIdField).toBe('uid');
        expect(firstLdap.displayNameField).toEqual(displayNameField);
        expect(firstLdap.profilePictureField).toEqual(profilePictureField);
        expect(firstLdap.bindDn).toEqual(bindDn);
        expect(firstLdap.bindCredentials).toEqual(bindCredentials);
        expect(firstLdap.tlsCaCerts).toEqual(tlsCaContent);
        restore();
      });

      it('when no HD_AUTH_LDAP_FUTURAMA_DISPLAY_NAME_FIELD is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLdapConfig,
            HD_AUTH_LDAP_FUTURAMA_DISPLAY_NAME_FIELD: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.ldap).toBeDefined();
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0]);
        expect(firstLdap.url).toEqual(url);
        expect(firstLdap.providerName).toEqual(providerName);
        expect(firstLdap.searchBase).toEqual(searchBase);
        expect(firstLdap.searchFilter).toEqual(searchFilter);
        expect(firstLdap.searchAttributes).toEqual(searchAttributes);
        expect(firstLdap.userIdField).toEqual(userIdField);
        expect(firstLdap.displayNameField).toEqual('displayName');
        expect(firstLdap.profilePictureField).toEqual(profilePictureField);
        expect(firstLdap.bindDn).toEqual(bindDn);
        expect(firstLdap.bindCredentials).toEqual(bindCredentials);
        expect(firstLdap.tlsCaCerts).toEqual(tlsCaContent);
        restore();
      });

      it('when no HD_AUTH_LDAP_FUTURAMA_PROFILE_PICTURE_FIELD is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLdapConfig,
            HD_AUTH_LDAP_FUTURAMA_PROFILE_PICTURE_FIELD: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.ldap).toBeDefined();
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0]);
        expect(firstLdap.url).toEqual(url);
        expect(firstLdap.providerName).toEqual(providerName);
        expect(firstLdap.searchBase).toEqual(searchBase);
        expect(firstLdap.searchFilter).toEqual(searchFilter);
        expect(firstLdap.searchAttributes).toEqual(searchAttributes);
        expect(firstLdap.userIdField).toEqual(userIdField);
        expect(firstLdap.displayNameField).toEqual(displayNameField);
        expect(firstLdap.profilePictureField).toEqual('jpegPhoto');
        expect(firstLdap.bindDn).toEqual(bindDn);
        expect(firstLdap.bindCredentials).toEqual(bindCredentials);
        expect(firstLdap.tlsCaCerts).toEqual(tlsCaContent);
        restore();
      });

      it('when no HD_AUTH_LDAP_FUTURAMA_BIND_DN is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLdapConfig,
            HD_AUTH_LDAP_FUTURAMA_BIND_DN: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.ldap).toBeDefined();
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0]);
        expect(firstLdap.url).toEqual(url);
        expect(firstLdap.providerName).toEqual(providerName);
        expect(firstLdap.searchBase).toEqual(searchBase);
        expect(firstLdap.searchFilter).toEqual(searchFilter);
        expect(firstLdap.searchAttributes).toEqual(searchAttributes);
        expect(firstLdap.userIdField).toEqual(userIdField);
        expect(firstLdap.displayNameField).toEqual(displayNameField);
        expect(firstLdap.profilePictureField).toEqual(profilePictureField);
        expect(firstLdap.bindDn).toBe(undefined);
        expect(firstLdap.bindCredentials).toEqual(bindCredentials);
        expect(firstLdap.tlsCaCerts).toEqual(tlsCaContent);
        restore();
      });

      it('when no HD_AUTH_LDAP_FUTURAMA_BIND_CREDENTIALS is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLdapConfig,
            HD_AUTH_LDAP_FUTURAMA_BIND_CREDENTIALS: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.ldap).toBeDefined();
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0]);
        expect(firstLdap.url).toEqual(url);
        expect(firstLdap.providerName).toEqual(providerName);
        expect(firstLdap.searchBase).toEqual(searchBase);
        expect(firstLdap.searchFilter).toEqual(searchFilter);
        expect(firstLdap.searchAttributes).toEqual(searchAttributes);
        expect(firstLdap.userIdField).toEqual(userIdField);
        expect(firstLdap.displayNameField).toEqual(displayNameField);
        expect(firstLdap.profilePictureField).toEqual(profilePictureField);
        expect(firstLdap.bindDn).toEqual(bindDn);
        expect(firstLdap.bindCredentials).toBe(undefined);
        expect(firstLdap.tlsCaCerts).toEqual(tlsCaContent);
        restore();
      });

      it('when no HD_AUTH_LDAP_FUTURAMA_TLS_CERT_PATHS is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLdapConfig,
            HD_AUTH_LDAP_FUTURAMA_TLS_CERT_PATHS: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.ldap).toBeDefined();
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0]);
        expect(firstLdap.url).toEqual(url);
        expect(firstLdap.providerName).toEqual(providerName);
        expect(firstLdap.searchBase).toEqual(searchBase);
        expect(firstLdap.searchFilter).toEqual(searchFilter);
        expect(firstLdap.searchAttributes).toEqual(searchAttributes);
        expect(firstLdap.userIdField).toEqual(userIdField);
        expect(firstLdap.displayNameField).toEqual(displayNameField);
        expect(firstLdap.profilePictureField).toEqual(profilePictureField);
        expect(firstLdap.bindDn).toEqual(bindDn);
        expect(firstLdap.bindCredentials).toEqual(bindCredentials);
        expect(firstLdap.tlsCaCerts).toBe(undefined);
        restore();
      });
    });
    describe('throws error', () => {
      it('when HD_AUTH_LDAP_FUTURAMA_URL is wrong', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLdapConfig,
            HD_AUTH_LDAP_FUTURAMA_URL: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => authConfig()).toThrow(
          'HD_AUTH_LDAP_FUTURAMA_URL: Required',
        );
        restore();
      });
      it('when HD_AUTH_LDAP_FUTURAMA_SEARCH_BASE is wrong', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLdapConfig,
            HD_AUTH_LDAP_FUTURAMA_SEARCH_BASE: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => authConfig()).toThrow(
          'HD_AUTH_LDAP_FUTURAMA_SEARCH_BASE: Required',
        );
        restore();
      });
      it('when HD_AUTH_LDAP_FUTURAMA_TLS_CERT_PATHS is wrong', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLdapConfig,
            HD_AUTH_LDAP_FUTURAMA_TLS_CERT_PATHS: 'not-a-file.pem',
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => authConfig()).toThrow(
          'HD_AUTH_LDAP_FUTURAMA_TLS_CA_CERTS[0]: File not found',
        );
        restore();
      });
    });
  });

  describe('oidc', () => {
    const oidcNames = ['gitlab'];
    const providerName = 'Gitlab oAuth2';
    const issuer = 'https://gitlab.example.org';
    const clientId = '1234567890';
    const clientSecret = 'ABCDEF';
    const theme = Theme.GITHUB;
    const authorizeUrl = 'https://example.org/auth';
    const tokenUrl = 'https://example.org/token';
    const userinfoUrl = 'https://example.org/user';
    const endSessionUrl = 'https://example.org/end';
    const scope = 'some scope';
    const defaultScope = 'openid profile email';
    const userIdField = 'login';
    const defaultUserIdField = 'sub';
    const userNameField = 'preferred_username';
    const displayNameField = 'displayName';
    const defaultDisplayNameField = 'name';
    const profilePictureField = 'pictureField';
    const defaultProfilePictureField = 'picture';
    const emailField = 'a_email';
    const defaultEmailField = 'email';
    const enableRegistration = 'false';
    const completeOidcConfig = {
      /* eslint-disable @typescript-eslint/naming-convention */
      HD_AUTH_OIDC_SERVERS: oidcNames.join(','),
      HD_AUTH_OIDC_GITLAB_PROVIDER_NAME: providerName,
      HD_AUTH_OIDC_GITLAB_ISSUER: issuer,
      HD_AUTH_OIDC_GITLAB_CLIENT_ID: clientId,
      HD_AUTH_OIDC_GITLAB_CLIENT_SECRET: clientSecret,
      HD_AUTH_OIDC_GITLAB_THEME: theme,
      HD_AUTH_OIDC_GITLAB_AUTHORIZE_URL: authorizeUrl,
      HD_AUTH_OIDC_GITLAB_TOKEN_URL: tokenUrl,
      HD_AUTH_OIDC_GITLAB_USERINFO_URL: userinfoUrl,
      HD_AUTH_OIDC_GITLAB_END_SESSION_URL: endSessionUrl,
      HD_AUTH_OIDC_GITLAB_SCOPE: scope,
      HD_AUTH_OIDC_GITLAB_USER_ID_FIELD: userIdField,
      HD_AUTH_OIDC_GITLAB_USER_NAME_FIELD: userNameField,
      HD_AUTH_OIDC_GITLAB_DISPLAY_NAME_FIELD: displayNameField,
      HD_AUTH_OIDC_GITLAB_PROFILE_PICTURE_FIELD: profilePictureField,
      HD_AUTH_OIDC_GITLAB_EMAIL_FIELD: emailField,
      HD_AUTH_OIDC_GITLAB_ENABLE_REGISTER: enableRegistration,
      /* eslint-enable @typescript-eslint/naming-convention */
    };
    describe('is correctly parsed', () => {
      it('when given correct and complete environment variables', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeOidcConfig,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.oidc).toBeDefined();
        expect(config.oidc).toHaveLength(1);
        const firstOidc = config.oidc[0];
        expect(firstOidc.identifier).toEqual(oidcNames[0]);
        expect(firstOidc.issuer).toEqual(issuer);
        expect(firstOidc.clientId).toEqual(clientId);
        expect(firstOidc.clientSecret).toEqual(clientSecret);
        expect(firstOidc.theme).toEqual(theme);
        expect(firstOidc.authorizeUrl).toEqual(authorizeUrl);
        expect(firstOidc.tokenUrl).toEqual(tokenUrl);
        expect(firstOidc.endSessionUrl).toEqual(endSessionUrl);
        expect(firstOidc.scope).toEqual(scope);
        expect(firstOidc.userinfoUrl).toEqual(userinfoUrl);
        expect(firstOidc.userIdField).toEqual(userIdField);
        expect(firstOidc.usernameField).toEqual(userNameField);
        expect(firstOidc.displayNameField).toEqual(displayNameField);
        expect(firstOidc.profilePictureField).toEqual(profilePictureField);
        expect(firstOidc.emailField).toEqual(emailField);
        expect(firstOidc.enableRegistration).toEqual(false);
        restore();
      });
      it('when HD_AUTH_OIDC_GITLAB_THEME is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeOidcConfig,
            HD_AUTH_OIDC_GITLAB_THEME: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.oidc).toBeDefined();
        expect(config.oidc).toHaveLength(1);
        const firstOidc = config.oidc[0];
        expect(firstOidc.identifier).toEqual(oidcNames[0]);
        expect(firstOidc.issuer).toEqual(issuer);
        expect(firstOidc.clientId).toEqual(clientId);
        expect(firstOidc.clientSecret).toEqual(clientSecret);
        expect(firstOidc.theme).toBeUndefined();
        expect(firstOidc.authorizeUrl).toEqual(authorizeUrl);
        expect(firstOidc.tokenUrl).toEqual(tokenUrl);
        expect(firstOidc.userinfoUrl).toEqual(userinfoUrl);
        expect(firstOidc.endSessionUrl).toEqual(endSessionUrl);
        expect(firstOidc.scope).toEqual(scope);
        expect(firstOidc.userIdField).toEqual(userIdField);
        expect(firstOidc.usernameField).toEqual(userNameField);
        expect(firstOidc.displayNameField).toEqual(displayNameField);
        expect(firstOidc.profilePictureField).toEqual(profilePictureField);
        expect(firstOidc.emailField).toEqual(emailField);
        expect(firstOidc.enableRegistration).toEqual(false);
        restore();
      });
      it('when HD_AUTH_OIDC_GITLAB_AUTHORIZE_URL is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeOidcConfig,
            HD_AUTH_OIDC_GITLAB_AUTHORIZE_URL: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.oidc).toBeDefined();
        expect(config.oidc).toHaveLength(1);
        const firstOidc = config.oidc[0];
        expect(firstOidc.identifier).toEqual(oidcNames[0]);
        expect(firstOidc.issuer).toEqual(issuer);
        expect(firstOidc.clientId).toEqual(clientId);
        expect(firstOidc.clientSecret).toEqual(clientSecret);
        expect(firstOidc.theme).toEqual(theme);
        expect(firstOidc.authorizeUrl).toBeUndefined();
        expect(firstOidc.tokenUrl).toEqual(tokenUrl);
        expect(firstOidc.userinfoUrl).toEqual(userinfoUrl);
        expect(firstOidc.endSessionUrl).toEqual(endSessionUrl);
        expect(firstOidc.scope).toEqual(scope);
        expect(firstOidc.userIdField).toEqual(userIdField);
        expect(firstOidc.usernameField).toEqual(userNameField);
        expect(firstOidc.displayNameField).toEqual(displayNameField);
        expect(firstOidc.profilePictureField).toEqual(profilePictureField);
        expect(firstOidc.emailField).toEqual(emailField);
        expect(firstOidc.enableRegistration).toEqual(false);
        restore();
      });
      it('when HD_AUTH_OIDC_GITLAB_TOKEN_URL is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeOidcConfig,
            HD_AUTH_OIDC_GITLAB_TOKEN_URL: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.oidc).toBeDefined();
        expect(config.oidc).toHaveLength(1);
        const firstOidc = config.oidc[0];
        expect(firstOidc.identifier).toEqual(oidcNames[0]);
        expect(firstOidc.issuer).toEqual(issuer);
        expect(firstOidc.clientId).toEqual(clientId);
        expect(firstOidc.clientSecret).toEqual(clientSecret);
        expect(firstOidc.theme).toEqual(theme);
        expect(firstOidc.authorizeUrl).toEqual(authorizeUrl);
        expect(firstOidc.tokenUrl).toBeUndefined();
        expect(firstOidc.userinfoUrl).toEqual(userinfoUrl);
        expect(firstOidc.endSessionUrl).toEqual(endSessionUrl);
        expect(firstOidc.scope).toEqual(scope);
        expect(firstOidc.userIdField).toEqual(userIdField);
        expect(firstOidc.usernameField).toEqual(userNameField);
        expect(firstOidc.displayNameField).toEqual(displayNameField);
        expect(firstOidc.profilePictureField).toEqual(profilePictureField);
        expect(firstOidc.emailField).toEqual(emailField);
        expect(firstOidc.enableRegistration).toEqual(false);
        restore();
      });
      it('when HD_AUTH_OIDC_GITLAB_USERINFO_URL is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeOidcConfig,
            HD_AUTH_OIDC_GITLAB_USERINFO_URL: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.oidc).toBeDefined();
        expect(config.oidc).toHaveLength(1);
        const firstOidc = config.oidc[0];
        expect(firstOidc.identifier).toEqual(oidcNames[0]);
        expect(firstOidc.issuer).toEqual(issuer);
        expect(firstOidc.clientId).toEqual(clientId);
        expect(firstOidc.clientSecret).toEqual(clientSecret);
        expect(firstOidc.theme).toEqual(theme);
        expect(firstOidc.authorizeUrl).toEqual(authorizeUrl);
        expect(firstOidc.tokenUrl).toEqual(tokenUrl);
        expect(firstOidc.userinfoUrl).toBeUndefined();
        expect(firstOidc.endSessionUrl).toEqual(endSessionUrl);
        expect(firstOidc.scope).toEqual(scope);
        expect(firstOidc.userIdField).toEqual(userIdField);
        expect(firstOidc.usernameField).toEqual(userNameField);
        expect(firstOidc.displayNameField).toEqual(displayNameField);
        expect(firstOidc.profilePictureField).toEqual(profilePictureField);
        expect(firstOidc.emailField).toEqual(emailField);
        expect(firstOidc.enableRegistration).toEqual(false);
        restore();
      });
      it('when HD_AUTH_OIDC_GITLAB_END_SESSION_URL is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeOidcConfig,
            HD_AUTH_OIDC_GITLAB_END_SESSION_URL: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.oidc).toBeDefined();
        expect(config.oidc).toHaveLength(1);
        const firstOidc = config.oidc[0];
        expect(firstOidc.identifier).toEqual(oidcNames[0]);
        expect(firstOidc.issuer).toEqual(issuer);
        expect(firstOidc.clientId).toEqual(clientId);
        expect(firstOidc.clientSecret).toEqual(clientSecret);
        expect(firstOidc.theme).toEqual(theme);
        expect(firstOidc.authorizeUrl).toEqual(authorizeUrl);
        expect(firstOidc.tokenUrl).toEqual(tokenUrl);
        expect(firstOidc.userinfoUrl).toEqual(userinfoUrl);
        expect(firstOidc.endSessionUrl).toBeUndefined();
        expect(firstOidc.scope).toEqual(scope);
        expect(firstOidc.userIdField).toEqual(userIdField);
        expect(firstOidc.usernameField).toEqual(userNameField);
        expect(firstOidc.displayNameField).toEqual(displayNameField);
        expect(firstOidc.profilePictureField).toEqual(profilePictureField);
        expect(firstOidc.emailField).toEqual(emailField);
        expect(firstOidc.enableRegistration).toEqual(false);
        restore();
      });
      it('when HD_AUTH_OIDC_GITLAB_SCOPE is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeOidcConfig,
            HD_AUTH_OIDC_GITLAB_SCOPE: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.oidc).toBeDefined();
        expect(config.oidc).toHaveLength(1);
        const firstOidc = config.oidc[0];
        expect(firstOidc.identifier).toEqual(oidcNames[0]);
        expect(firstOidc.issuer).toEqual(issuer);
        expect(firstOidc.clientId).toEqual(clientId);
        expect(firstOidc.clientSecret).toEqual(clientSecret);
        expect(firstOidc.theme).toEqual(theme);
        expect(firstOidc.authorizeUrl).toEqual(authorizeUrl);
        expect(firstOidc.tokenUrl).toEqual(tokenUrl);
        expect(firstOidc.userinfoUrl).toEqual(userinfoUrl);
        expect(firstOidc.endSessionUrl).toEqual(endSessionUrl);
        expect(firstOidc.scope).toEqual(defaultScope);
        expect(firstOidc.userIdField).toEqual(userIdField);
        expect(firstOidc.usernameField).toEqual(userNameField);
        expect(firstOidc.displayNameField).toEqual(displayNameField);
        expect(firstOidc.profilePictureField).toEqual(profilePictureField);
        expect(firstOidc.emailField).toEqual(emailField);
        expect(firstOidc.enableRegistration).toEqual(false);
        restore();
      });
      it('when HD_AUTH_OIDC_GITLAB_USER_ID_FIELD is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeOidcConfig,
            HD_AUTH_OIDC_GITLAB_USER_ID_FIELD: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.oidc).toBeDefined();
        expect(config.oidc).toHaveLength(1);
        const firstOidc = config.oidc[0];
        expect(firstOidc.identifier).toEqual(oidcNames[0]);
        expect(firstOidc.issuer).toEqual(issuer);
        expect(firstOidc.clientId).toEqual(clientId);
        expect(firstOidc.clientSecret).toEqual(clientSecret);
        expect(firstOidc.theme).toEqual(theme);
        expect(firstOidc.authorizeUrl).toEqual(authorizeUrl);
        expect(firstOidc.tokenUrl).toEqual(tokenUrl);
        expect(firstOidc.scope).toEqual(scope);
        expect(firstOidc.userinfoUrl).toEqual(userinfoUrl);
        expect(firstOidc.endSessionUrl).toEqual(endSessionUrl);
        expect(firstOidc.userIdField).toEqual(defaultUserIdField);
        expect(firstOidc.usernameField).toEqual(userNameField);
        expect(firstOidc.displayNameField).toEqual(displayNameField);
        expect(firstOidc.profilePictureField).toEqual(profilePictureField);
        expect(firstOidc.emailField).toEqual(emailField);
        expect(firstOidc.enableRegistration).toEqual(false);
        restore();
      });
      it('when HD_AUTH_OIDC_GITLAB_DISPLAY_NAME_FIELD is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeOidcConfig,
            HD_AUTH_OIDC_GITLAB_DISPLAY_NAME_FIELD: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.oidc).toBeDefined();
        expect(config.oidc).toHaveLength(1);
        const firstOidc = config.oidc[0];
        expect(firstOidc.identifier).toEqual(oidcNames[0]);
        expect(firstOidc.issuer).toEqual(issuer);
        expect(firstOidc.clientId).toEqual(clientId);
        expect(firstOidc.clientSecret).toEqual(clientSecret);
        expect(firstOidc.theme).toEqual(theme);
        expect(firstOidc.authorizeUrl).toEqual(authorizeUrl);
        expect(firstOidc.tokenUrl).toEqual(tokenUrl);
        expect(firstOidc.scope).toEqual(scope);
        expect(firstOidc.userinfoUrl).toEqual(userinfoUrl);
        expect(firstOidc.endSessionUrl).toEqual(endSessionUrl);
        expect(firstOidc.userIdField).toEqual(userIdField);
        expect(firstOidc.usernameField).toEqual(userNameField);
        expect(firstOidc.displayNameField).toEqual(defaultDisplayNameField);
        expect(firstOidc.profilePictureField).toEqual(profilePictureField);
        expect(firstOidc.emailField).toEqual(emailField);
        expect(firstOidc.enableRegistration).toEqual(false);
        restore();
      });
      it('when HD_AUTH_OIDC_GITLAB_PROFILE_PICTURE_FIELD is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeOidcConfig,
            HD_AUTH_OIDC_GITLAB_PROFILE_PICTURE_FIELD: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.oidc).toBeDefined();
        expect(config.oidc).toHaveLength(1);
        const firstOidc = config.oidc[0];
        expect(firstOidc.identifier).toEqual(oidcNames[0]);
        expect(firstOidc.issuer).toEqual(issuer);
        expect(firstOidc.clientId).toEqual(clientId);
        expect(firstOidc.clientSecret).toEqual(clientSecret);
        expect(firstOidc.theme).toEqual(theme);
        expect(firstOidc.authorizeUrl).toEqual(authorizeUrl);
        expect(firstOidc.tokenUrl).toEqual(tokenUrl);
        expect(firstOidc.scope).toEqual(scope);
        expect(firstOidc.userinfoUrl).toEqual(userinfoUrl);
        expect(firstOidc.endSessionUrl).toEqual(endSessionUrl);
        expect(firstOidc.userIdField).toEqual(userIdField);
        expect(firstOidc.usernameField).toEqual(userNameField);
        expect(firstOidc.displayNameField).toEqual(displayNameField);
        expect(firstOidc.profilePictureField).toEqual(
          defaultProfilePictureField,
        );
        expect(firstOidc.emailField).toEqual(emailField);
        expect(firstOidc.enableRegistration).toEqual(false);
        restore();
      });
      it('when HD_AUTH_OIDC_GITLAB_EMAIL_FIELD is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeOidcConfig,
            HD_AUTH_OIDC_GITLAB_EMAIL_FIELD: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.oidc).toBeDefined();
        expect(config.oidc).toHaveLength(1);
        const firstOidc = config.oidc[0];
        expect(firstOidc.identifier).toEqual(oidcNames[0]);
        expect(firstOidc.issuer).toEqual(issuer);
        expect(firstOidc.clientId).toEqual(clientId);
        expect(firstOidc.clientSecret).toEqual(clientSecret);
        expect(firstOidc.theme).toEqual(theme);
        expect(firstOidc.authorizeUrl).toEqual(authorizeUrl);
        expect(firstOidc.tokenUrl).toEqual(tokenUrl);
        expect(firstOidc.scope).toEqual(scope);
        expect(firstOidc.userinfoUrl).toEqual(userinfoUrl);
        expect(firstOidc.endSessionUrl).toEqual(endSessionUrl);
        expect(firstOidc.userIdField).toEqual(userIdField);
        expect(firstOidc.usernameField).toEqual(userNameField);
        expect(firstOidc.displayNameField).toEqual(displayNameField);
        expect(firstOidc.profilePictureField).toEqual(profilePictureField);
        expect(firstOidc.emailField).toEqual(defaultEmailField);
        expect(firstOidc.enableRegistration).toEqual(false);
        restore();
      });
      it('when HD_AUTH_OIDC_GITLAB_ENABLE_REGISTER is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeOidcConfig,
            HD_AUTH_OIDC_GITLAB_ENABLE_REGISTER: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        const config = authConfig();
        expect(config.oidc).toBeDefined();
        expect(config.oidc).toHaveLength(1);
        const firstOidc = config.oidc[0];
        expect(firstOidc.identifier).toEqual(oidcNames[0]);
        expect(firstOidc.issuer).toEqual(issuer);
        expect(firstOidc.clientId).toEqual(clientId);
        expect(firstOidc.clientSecret).toEqual(clientSecret);
        expect(firstOidc.theme).toEqual(theme);
        expect(firstOidc.authorizeUrl).toEqual(authorizeUrl);
        expect(firstOidc.tokenUrl).toEqual(tokenUrl);
        expect(firstOidc.scope).toEqual(scope);
        expect(firstOidc.userinfoUrl).toEqual(userinfoUrl);
        expect(firstOidc.endSessionUrl).toEqual(endSessionUrl);
        expect(firstOidc.userIdField).toEqual(userIdField);
        expect(firstOidc.usernameField).toEqual(userNameField);
        expect(firstOidc.displayNameField).toEqual(displayNameField);
        expect(firstOidc.profilePictureField).toEqual(profilePictureField);
        expect(firstOidc.emailField).toEqual(emailField);
        expect(firstOidc.enableRegistration).toEqual(true);
        restore();
      });
    });
    describe('throws error', () => {
      it('when HD_AUTH_OIDC_GITLAB_ISSUER is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeOidcConfig,
            HD_AUTH_OIDC_GITLAB_ISSUER: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => authConfig()).toThrow(
          'HD_AUTH_OIDC_GITLAB_ISSUER: Required',
        );
        restore();
      });
      it('when HD_AUTH_OIDC_GITLAB_CLIENT_ID is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeOidcConfig,
            HD_AUTH_OIDC_GITLAB_CLIENT_ID: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => authConfig()).toThrow(
          'HD_AUTH_OIDC_GITLAB_CLIENT_ID: Required',
        );
        restore();
      });
      it('when HD_AUTH_OIDC_GITLAB_CLIENT_SECRET is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeOidcConfig,
            HD_AUTH_OIDC_GITLAB_CLIENT_SECRET: undefined,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => authConfig()).toThrow(
          'HD_AUTH_OIDC_GITLAB_CLIENT_SECRET: Required',
        );
        restore();
      });
      it('when HD_AUTH_OIDC_GITLAB_THEME is set to a wrong value', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeOidcConfig,
            HD_AUTH_OIDC_GITLAB_THEME: 'something else',
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => authConfig()).toThrow(
          "HD_AUTH_OIDC_GITLAB_THEME: Invalid enum value. Expected 'google' | 'github' | 'gitlab' | 'facebook' | 'discord' | 'mastodon' | 'azure', received 'something else'",
        );
        restore();
      });
    });
  });
});
