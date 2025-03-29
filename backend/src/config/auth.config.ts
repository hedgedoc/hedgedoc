/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import fs from 'fs';
import z from 'zod';

import { Theme } from './theme.enum';
import {
  ensureNoDuplicatesExist,
  parseOptionalBoolean,
  parseOptionalNumber,
  toArrayConfig,
} from './utils';
import {
  buildErrorMessage,
  extractDescriptionFromZodIssue,
} from './zod-error-message';

const ldapSchema = z
  .object({
    identifier: z.string().describe('HD_AUTH_LDAP_SERVERS'),
    providerName: z
      .string()
      .default('LDAP')
      .describe('HD_AUTH_LDAP_*_PROVIDER_NAME'),
    url: z.string().describe('HD_AUTH_LDAP_*_URL'),
    bindDn: z.string().optional().describe('HD_AUTH_LDAP_*_BIND_DN'),
    bindCredentials: z
      .string()
      .optional()
      .describe('HD_AUTH_LDAP_*_BIND_CREDENTIALS'),
    searchBase: z.string().describe('HD_AUTH_LDAP_*_SEARCH_BASE'),
    searchFilter: z
      .string()
      .default('(uid={{username}})')
      .describe('HD_AUTH_LDAP_*_SEARCH_FILTER'),
    searchAttributes: z
      .array(z.string())
      .optional()
      .describe('HD_AUTH_LDAP_*_SEARCH_ATTRIBUTES'),
    userIdField: z
      .string()
      .default('uid')
      .describe('HD_AUTH_LDAP_*_USER_ID_FIELD'),
    displayNameField: z
      .string()
      .default('displayName')
      .describe('HD_AUTH_LDAP_*_DISPLAY_NAME_FIELD'),
    emailField: z
      .string()
      .default('mail')
      .describe('HD_AUTH_LDAP_*_EMAIL_FIELD'),
    profilePictureField: z
      .string()
      .default('jpegPhoto')
      .describe('HD_AUTH_LDAP_*_PROFILE_PICTURE_FIELD'),
    tlsCaCerts: z
      .array(
        z.string({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          required_error: 'File not found',
        }),
      )
      .optional()
      .describe('HD_AUTH_LDAP_*_TLS_CA_CERTS'),
    tlsRejectUnauthorized: z
      .boolean()
      .default(true)
      .describe('HD_AUTH_LDAP_*_TLS_REJECT_UNAUTHORIZED'),
    tlsSniName: z.string().optional().describe('HD_AUTH_LDAP_*_TLS_SNI_NAME'),
    tlsAllowPartialTrustChain: z
      .boolean()
      .optional()
      .describe('HD_AUTH_LDAP_*_TLS_ALLOW_PARTIAL_TRUST_CHAIN'),
    tlsMinVersion: z
      .enum(['TLSv1', 'TLSv1.1', 'TLSv1.2', 'TLSv1.3'])
      .optional()
      .describe('HD_AUTH_LDAP_*_TLS_MIN_VERSION'),
    tlsMaxVersion: z
      .enum(['TLSv1', 'TLSv1.1', 'TLSv1.2', 'TLSv1.3'])
      .optional()
      .describe('HD_AUTH_LDAP_*_TLS_MAX_VERSION'),
  })
  .superRefine((config, ctx) => {
    const tlsMin = config.tlsMinVersion?.replace('TLSv', '');
    const tlsMax = config.tlsMaxVersion?.replace('TLSv', '');
    if (tlsMin && tlsMax && tlsMin > tlsMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'TLS min version must be less than or equal to TLS max version',
        fatal: true,
      });
    }
    if ((tlsMin && tlsMin < '1.2') || (tlsMax && tlsMax < '1.2')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'For security reasons, consider using TLS version 1.2 or higher',
        fatal: false,
      });
    }
  });

const oidcSchema = z.object({
  identifier: z.string().describe('HD_AUTH_OIDC_SERVERS'),
  providerName: z
    .string()
    .default('OpenID Connect')
    .describe('HD_AUTH_OIDC_*_PROVIDER_NAME'),
  issuer: z.string().url().describe('HD_AUTH_OIDC_*_ISSUER'),
  clientId: z.string().describe('HD_AUTH_OIDC_*_CLIENT_ID'),
  clientSecret: z.string().describe('HD_AUTH_OIDC_*_CLIENT_SECRET'),
  theme: z.nativeEnum(Theme).optional().describe('HD_AUTH_OIDC_*_THEME'),
  authorizeUrl: z
    .string()
    .url()
    .optional()
    .describe('HD_AUTH_OIDC_*_AUTHORIZE_URL'),
  tokenUrl: z.string().url().optional().describe('HD_AUTH_OIDC_*_TOKEN_URL'),
  userinfoUrl: z
    .string()
    .url()
    .optional()
    .describe('HD_AUTH_OIDC_*_USERINFO_URL'),
  endSessionUrl: z
    .string()
    .url()
    .optional()
    .describe('HD_AUTH_OIDC_*_END_SESSION_URL'),
  scope: z
    .string()
    .default('openid profile email')
    .describe('HD_AUTH_OIDC_*_SCOPE'),
  usernameField: z
    .string()
    .default('preferred_username')
    .describe('HD_AUTH_OIDC_*_USERNAME_FIELD'),
  userIdField: z
    .string()
    .default('sub')
    .describe('HD_AUTH_OIDC_*_USER_ID_FIELD'),
  displayNameField: z
    .string()
    .default('name')
    .describe('HD_AUTH_OIDC_*_DISPLAY_NAME_FIELD'),
  profilePictureField: z
    .string()
    .default('picture')
    .describe('HD_AUTH_OIDC_*_PROFILE_PICTURE_FIELD'),
  emailField: z
    .string()
    .default('email')
    .describe('HD_AUTH_OIDC_*_EMAIL_FIELD'),
  enableRegistration: z
    .boolean()
    .default(true)
    .describe('HD_AUTH_OIDC_*_ENABLE_REGISTRATION'),
});

const schema = z.object({
  common: z.object({
    allowProfileEdits: z
      .boolean()
      .default(true)
      .describe('HD_AUTH_ALLOW_PROFILE_EDITS'),
    allowChooseUsername: z
      .boolean()
      .default(true)
      .describe('HD_AUTH_ALLOW_CHOOSE_USERNAME'),
    syncSource: z.string().optional().describe('HD_AUTH_SYNC_SOURCE'),
  }),
  session: z.object({
    secret: z.string().describe('HD_SESSION_SECRET'),
    lifetime: z.number().default(1209600).describe('HD_SESSION_LIFETIME'), // 14 * 24 * 60 * 60s = 14 days
  }),
  local: z.object({
    enableLogin: z
      .boolean()
      .default(false)
      .describe('HD_AUTH_LOCAL_ENABLE_LOGIN'),
    enableRegister: z
      .boolean()
      .default(false)
      .describe('HD_AUTH_LOCAL_ENABLE_REGISTER'),
    minimalPasswordStrength: z.coerce
      .number()
      .min(0)
      .max(4)
      .default(2)
      .describe('HD_AUTH_LOCAL_MINIMAL_PASSWORD_STRENGTH'),
  }),
  ldap: z.array(ldapSchema).describe('HD_AUTH_LDAP_*'),
  oidc: z.array(oidcSchema).describe('HD_AUTH_OIDC_*'),
});

export type AuthConfig = z.infer<typeof schema>;
export type LdapConfig = z.infer<typeof ldapSchema>;
export type OidcConfig = z.infer<typeof oidcSchema>;

export default registerAs('authConfig', () => {
  const ldapServers = (process.env.HD_AUTH_LDAP_SERVERS?.split(',') ?? []).map(
    (name) => name.toUpperCase(),
  );
  ensureNoDuplicatesExist('LDAP', ldapServers);

  const oidcServers = (process.env.HD_AUTH_OIDC_SERVERS?.split(',') ?? []).map(
    (name) => name.toUpperCase(),
  );
  ensureNoDuplicatesExist('OIDC', oidcServers);

  const ldapConfig: Partial<LdapConfig>[] = ldapServers.map((name) => {
    const caFiles = toArrayConfig(
      process.env[`HD_AUTH_LDAP_${name}_TLS_CERT_PATHS`],
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
      identifier: name.toLowerCase(),
      providerName: process.env[`HD_AUTH_LDAP_${name}_PROVIDER_NAME`],
      url: process.env[`HD_AUTH_LDAP_${name}_URL`],
      bindDn: process.env[`HD_AUTH_LDAP_${name}_BIND_DN`],
      bindCredentials: process.env[`HD_AUTH_LDAP_${name}_BIND_CREDENTIALS`],
      searchBase: process.env[`HD_AUTH_LDAP_${name}_SEARCH_BASE`],
      searchFilter: process.env[`HD_AUTH_LDAP_${name}_SEARCH_FILTER`],
      searchAttributes:
        process.env[`HD_AUTH_LDAP_${name}_SEARCH_ATTRIBUTES`]?.split(','),
      userIdField: process.env[`HD_AUTH_LDAP_${name}_USER_ID_FIELD`],
      displayNameField: process.env[`HD_AUTH_LDAP_${name}_DISPLAY_NAME_FIELD`],
      emailField: process.env[`HD_AUTH_LDAP_${name}_EMAIL_FIELD`],
      profilePictureField:
        process.env[`HD_AUTH_LDAP_${name}_PROFILE_PICTURE_FIELD`],
      // Technically this can be (string | undefined)[] | undefined, but an undefined array element tells us that the file is not there and the user input is invalid
      tlsCaCerts: tlsCaCerts as string[] | undefined,
      tlsRejectUnauthorized: parseOptionalBoolean(
        process.env[`HD_AUTH_LDAP_${name}_TLS_REJECT_UNAUTHORIZED`],
      ),
      tlsSniName: process.env[`HD_AUTH_LDAP_${name}_TLS_SNI_NAME`],
      tlsAllowPartialTrustChain: parseOptionalBoolean(
        process.env[`HD_AUTH_LDAP_${name}_TLS_ALLOW_PARTIAL_TRUST_CHAIN`],
      ),
      tlsMinVersion: process.env[`HD_AUTH_LDAP_${name}_TLS_MIN_VERSION`] as
        | 'TLSv1' // This typecast is required since zod validates the input later but TypeScript already expects valid input
        | undefined,
      tlsMaxVersion: process.env[`HD_AUTH_LDAP_${name}_TLS_MAX_VERSION`] as
        | 'TLSv1'
        | undefined,
    };
  });

  const oidcConfig: Partial<OidcConfig>[] = oidcServers.map((name) => ({
    identifier: name.toLowerCase(),
    providerName: process.env[`HD_AUTH_OIDC_${name}_PROVIDER_NAME`],
    issuer: process.env[`HD_AUTH_OIDC_${name}_ISSUER`],
    clientId: process.env[`HD_AUTH_OIDC_${name}_CLIENT_ID`],
    clientSecret: process.env[`HD_AUTH_OIDC_${name}_CLIENT_SECRET`],
    theme: process.env[`HD_AUTH_OIDC_${name}_THEME`] as Theme | undefined,
    authorizeUrl: process.env[`HD_AUTH_OIDC_${name}_AUTHORIZE_URL`],
    tokenUrl: process.env[`HD_AUTH_OIDC_${name}_TOKEN_URL`],
    userinfoUrl: process.env[`HD_AUTH_OIDC_${name}_USERINFO_URL`],
    endSessionUrl: process.env[`HD_AUTH_OIDC_${name}_END_SESSION_URL`],
    scope: process.env[`HD_AUTH_OIDC_${name}_SCOPE`],
    userIdField: process.env[`HD_AUTH_OIDC_${name}_USER_ID_FIELD`],
    userNameField: process.env[`HD_AUTH_OIDC_${name}_USER_NAME_FIELD`],
    displayNameField: process.env[`HD_AUTH_OIDC_${name}_DISPLAY_NAME_FIELD`],
    profilePictureField:
      process.env[`HD_AUTH_OIDC_${name}_PROFILE_PICTURE_FIELD`],
    emailField: process.env[`HD_AUTH_OIDC_${name}_EMAIL_FIELD`],
    enableRegistration: parseOptionalBoolean(
      process.env[`HD_AUTH_OIDC_${name}_ENABLE_REGISTER`],
    ),
  }));

  const authConfig = schema.safeParse({
    common: {
      allowProfileEdits: parseOptionalBoolean(
        process.env.HD_AUTH_ALLOW_PROFILE_EDITS,
      ),
      allowChooseUsername: parseOptionalBoolean(
        process.env.HD_AUTH_ALLOW_CHOOSE_USERNAME,
      ),
      syncSource: process.env.HD_AUTH_SYNC_SOURCE?.toLowerCase(),
    },
    session: {
      secret: process.env.HD_SESSION_SECRET,
      lifetime: parseOptionalNumber(process.env.HD_SESSION_LIFETIME),
    },
    local: {
      enableLogin: parseOptionalBoolean(process.env.HD_AUTH_LOCAL_ENABLE_LOGIN),
      enableRegister: parseOptionalBoolean(
        process.env.HD_AUTH_LOCAL_ENABLE_REGISTER,
      ),
      minimalPasswordStrength: parseOptionalNumber(
        process.env.HD_AUTH_LOCAL_MINIMAL_PASSWORD_STRENGTH,
      ),
    },
    ldap: ldapConfig,
    oidc: oidcConfig,
  });

  if (authConfig.error) {
    const errorMessages = authConfig.error.errors.map((issue) =>
      extractDescriptionFromZodIssue(issue, 'HD_AUTH', {
        ldap: ldapServers,
        oidc: oidcServers,
      }),
    );
    throw new Error(buildErrorMessage(errorMessages));
  }

  return authConfig.data;
});
