/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import mockedEnv from 'mocked-env';

import authConfig from './auth.config';

describe('authConfig', () => {
  const secret = 'this-is-a-secret';
  const neededAuthConfig = {
    /* eslint-disable @typescript-eslint/naming-convention */
    HD_SESSION_SECRET: secret,
    /* eslint-enable @typescript-eslint/naming-convention */
  };

  describe('ldap', () => {
    const ldapNames = ['futurama'];
    const providerName = 'Futurama LDAP';
    const url = 'ldap://localhost:389';
    const searchBase = 'ou=people,dc=planetexpress,dc=com';
    const searchFilter = '(mail={{username}})';
    const searchAttributes = ['mail', 'uid'];
    const userIdField = 'non_default_uid';
    const displayNameField = 'non_default_display_name';
    const profilePictureField = 'non_default_profile_picture';
    const bindDn = 'cn=admin,dc=planetexpress,dc=com';
    const bindCredentials = 'GoodNewsEveryone';
    const tlsCa = ['./test/private-api/fixtures/hedgedoc.pem'];
    const tlsCaContent = ['test-cert\n'];
    const completeLdapConfig = {
      /* eslint-disable @typescript-eslint/naming-convention */
      HD_AUTH_LDAPS: ldapNames.join(','),
      HD_AUTH_LDAP_FUTURAMA_PROVIDER_NAME: providerName,
      HD_AUTH_LDAP_FUTURAMA_URL: url,
      HD_AUTH_LDAP_FUTURAMA_SEARCH_BASE: searchBase,
      HD_AUTH_LDAP_FUTURAMA_SEARCH_FILTER: searchFilter,
      HD_AUTH_LDAP_FUTURAMA_SEARCH_ATTRIBUTES: searchAttributes.join(','),
      HD_AUTH_LDAP_FUTURAMA_USER_ID_FIELD: userIdField,
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
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0].toUpperCase());
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
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0].toUpperCase());
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
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0].toUpperCase());
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
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0].toUpperCase());
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
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0].toUpperCase());
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
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0].toUpperCase());
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
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0].toUpperCase());
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
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0].toUpperCase());
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
        expect(config.ldap).toHaveLength(1);
        const firstLdap = config.ldap[0];
        expect(firstLdap.identifier).toEqual(ldapNames[0].toUpperCase());
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
          '"HD_AUTH_LDAP_FUTURAMA_URL" is required',
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
          '"HD_AUTH_LDAP_FUTURAMA_SEARCH_BASE" is required',
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
          '"HD_AUTH_LDAP_FUTURAMA_TLS_CERT_PATHS[0]" must not be a sparse array item',
        );
        restore();
      });
    });
  });
});
