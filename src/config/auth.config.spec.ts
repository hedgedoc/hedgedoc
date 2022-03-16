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
    const useridField = 'uid';
    const usernameField = 'username';
    const bindDn = 'cn=admin,dc=planetexpress,dc=com';
    const bindCredentials = 'GoodNewsEveryone';
    const tlsCa = ['./hedgedoc.pem'];
    const completeLdapConfig = {
      /* eslint-disable @typescript-eslint/naming-convention */
      HD_AUTH_LDAPS: ldapNames.join(','),
      HD_AUTH_LDAP_FUTURAMA_PROVIDER_NAME: providerName,
      HD_AUTH_LDAP_FUTURAMA_URL: url,
      HD_AUTH_LDAP_FUTURAMA_SEARCH_BASE: searchBase,
      HD_AUTH_LDAP_FUTURAMA_SEARCH_FILTER: searchFilter,
      HD_AUTH_LDAP_FUTURAMA_SEARCH_ATTRIBUTES: searchAttributes.join(','),
      HD_AUTH_LDAP_FUTURAMA_USERID_FIELD: useridField,
      HD_AUTH_LDAP_FUTURAMA_USERNAME_FIELD: usernameField,
      HD_AUTH_LDAP_FUTURAMA_BIND_DN: bindDn,
      HD_AUTH_LDAP_FUTURAMA_BIND_CREDENTIALS: bindCredentials,
      HD_AUTH_LDAP_FUTURAMA_TLS_CA: tlsCa.join(','),
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
        expect(firstLdap.useridField).toEqual(useridField);
        expect(firstLdap.usernameField).toEqual(usernameField);
        expect(firstLdap.bindDn).toEqual(bindDn);
        expect(firstLdap.bindCredentials).toEqual(bindCredentials);
        expect(firstLdap.tlsCa).toEqual(tlsCa);
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
        expect(firstLdap.useridField).toEqual(useridField);
        expect(firstLdap.usernameField).toEqual(usernameField);
        expect(firstLdap.bindDn).toEqual(bindDn);
        expect(firstLdap.bindCredentials).toEqual(bindCredentials);
        expect(firstLdap.tlsCa).toEqual(tlsCa);
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
        expect(firstLdap.useridField).toEqual(useridField);
        expect(firstLdap.usernameField).toEqual(usernameField);
        expect(firstLdap.bindDn).toEqual(bindDn);
        expect(firstLdap.bindCredentials).toEqual(bindCredentials);
        expect(firstLdap.tlsCa).toEqual(tlsCa);
        restore();
      });

      it('when no HD_AUTH_LDAP_FUTURAMA_SEARCH_ATTRIBUTES is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLdapConfig,
            HD_AUTH_LDAP_FUTURAMA_SEARCH_ATTRIBUTES: undefined,
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
        expect(firstLdap.searchAttributes).toHaveLength(2);
        expect(firstLdap.searchAttributes[0]).toEqual('displayName');
        expect(firstLdap.searchAttributes[1]).toEqual('mail');
        expect(firstLdap.useridField).toEqual(useridField);
        expect(firstLdap.usernameField).toEqual(usernameField);
        expect(firstLdap.bindDn).toEqual(bindDn);
        expect(firstLdap.bindCredentials).toEqual(bindCredentials);
        expect(firstLdap.tlsCa).toEqual(tlsCa);
        restore();
      });

      it('when no HD_AUTH_LDAP_FUTURAMA_USERID_FIELD is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLdapConfig,
            HD_AUTH_LDAP_FUTURAMA_USERID_FIELD: undefined,
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
        expect(firstLdap.useridField).toBe(undefined);
        expect(firstLdap.usernameField).toEqual(usernameField);
        expect(firstLdap.bindDn).toEqual(bindDn);
        expect(firstLdap.bindCredentials).toEqual(bindCredentials);
        expect(firstLdap.tlsCa).toEqual(tlsCa);
        restore();
      });

      it('when no HD_AUTH_LDAP_FUTURAMA_USERNAME_FIELD is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLdapConfig,
            HD_AUTH_LDAP_FUTURAMA_USERNAME_FIELD: undefined,
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
        expect(firstLdap.useridField).toEqual(useridField);
        expect(firstLdap.usernameField).toBe(undefined);
        expect(firstLdap.bindDn).toEqual(bindDn);
        expect(firstLdap.bindCredentials).toEqual(bindCredentials);
        expect(firstLdap.tlsCa).toEqual(tlsCa);
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
        expect(firstLdap.useridField).toEqual(useridField);
        expect(firstLdap.usernameField).toEqual(usernameField);
        expect(firstLdap.bindDn).toBe(undefined);
        expect(firstLdap.bindCredentials).toEqual(bindCredentials);
        expect(firstLdap.tlsCa).toEqual(tlsCa);
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
        expect(firstLdap.useridField).toEqual(useridField);
        expect(firstLdap.usernameField).toEqual(usernameField);
        expect(firstLdap.bindDn).toEqual(bindDn);
        expect(firstLdap.bindCredentials).toBe(undefined);
        expect(firstLdap.tlsCa).toEqual(tlsCa);
        restore();
      });

      it('when no HD_AUTH_LDAP_FUTURAMA_TLS_CA is not set', () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            ...neededAuthConfig,
            ...completeLdapConfig,
            HD_AUTH_LDAP_FUTURAMA_TLS_CA: undefined,
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
        expect(firstLdap.useridField).toEqual(useridField);
        expect(firstLdap.usernameField).toEqual(usernameField);
        expect(firstLdap.bindDn).toEqual(bindDn);
        expect(firstLdap.bindCredentials).toEqual(bindCredentials);
        expect(firstLdap.tlsCa).toBe(undefined);
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
    });
  });
});
