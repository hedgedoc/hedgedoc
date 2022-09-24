/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';

import { AuthConfig } from '../auth.config';

export default registerAs(
  'authConfig',
  (): AuthConfig => ({
    session: {
      secret: 'my_secret',
      lifetime: 1209600000,
    },
    local: {
      enableLogin: true,
      enableRegister: true,
      minimalPasswordStrength: 2,
    },
    facebook: {
      clientID: '',
      clientSecret: '',
    },
    twitter: {
      consumerKey: '',
      consumerSecret: '',
    },
    github: {
      clientID: '',
      clientSecret: '',
    },
    dropbox: {
      clientID: '',
      clientSecret: '',
      appKey: '',
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
  }),
);
