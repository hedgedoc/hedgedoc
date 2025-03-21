/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'
import { ProviderType } from '../auth/index.js'

export const AuthProviderWithCustomNameSchema = z
  .object({
    type: z
      .literal(ProviderType.LDAP)
      .or(z.literal(ProviderType.OIDC))
      .describe('The type of the auth provider'),
    identifier: z
      .string()
      .describe('The identifier with which the auth provider can be called'),
    providerName: z.string().describe('The name given to the auth provider'),
    theme: z
      .string()
      .nullable()
      .describe('The theme to apply for the login button.'),
  })
  .describe(
    'The configuration for an auth provider with a custom name. So you can have multiple of the same kind.',
  )

export type AuthProviderWithCustomNameDto = z.infer<
  typeof AuthProviderWithCustomNameSchema
>
