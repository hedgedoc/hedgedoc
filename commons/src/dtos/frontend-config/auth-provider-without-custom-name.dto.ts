/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'
import { ProviderType } from '../auth/index.js'

export const AuthProviderWithoutCustomNameSchema = z
  .object({
    type: z
      .literal(ProviderType.LOCAL)
      .describe('The type of the auth provider'),
  })
  .describe('Represents the local authentication provider')

export type AuthProviderWithoutCustomNameDto = z.infer<
  typeof AuthProviderWithoutCustomNameSchema
>
