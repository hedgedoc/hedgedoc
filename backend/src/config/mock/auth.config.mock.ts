/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigFactoryKeyHost, registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';

import { AuthConfig } from '../auth.config';

export function createDefaultMockAuthConfig(): AuthConfig {
  return {
    session: {
      secret: 'my_secret',
      lifetime: 1209600000,
    },
    local: {
      enableLogin: true,
      enableRegister: true,
      minimalPasswordStrength: 2,
    },
    github: {
      clientID: '',
      clientSecret: '',
    },
    google: {
      clientID: '',
      clientSecret: '',
      apiKey: '',
    },
    gitlab: [],
    ldap: [],
    saml: [],
    oauth2: [],
  };
}

export function registerAuthConfig(
  authConfig: AuthConfig,
): ConfigFactory<AuthConfig> & ConfigFactoryKeyHost<AuthConfig> {
  return registerAs('authConfig', (): AuthConfig => authConfig);
}

export default registerAuthConfig(createDefaultMockAuthConfig());
