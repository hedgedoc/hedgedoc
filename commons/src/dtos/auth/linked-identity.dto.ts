/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'
import { AuthProviderType } from './auth-provider-type.enum.js'

export const LinkedIdentitySchema = z
  .object({
    providerType: z
      .enum([AuthProviderType.LOCAL, AuthProviderType.LDAP, AuthProviderType.OIDC])
      .describe('The type of authentication provider'),
    providerIdentifier: z
      .string()
      .nullable()
      .describe('The configured provider identifier when applicable'),
    createdAt: z
      .string()
      .datetime({ offset: false, local: false })
      .describe('When the identity was linked'),
  })
  .describe('A login identity linked to the current user account')

export type LinkedIdentityInterface = z.infer<typeof LinkedIdentitySchema>
