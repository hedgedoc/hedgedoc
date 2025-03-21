/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { AuthProviderWithCustomNameSchema } from './auth-provider-with-custom-name.dto.js'
import { AuthProviderWithoutCustomNameSchema } from './auth-provider-without-custom-name.dto.js'
import { z } from 'zod'

export const AuthProviderSchema = z
  .union([
    AuthProviderWithoutCustomNameSchema,
    AuthProviderWithCustomNameSchema,
  ])
  .describe('A general type for all auth providers')

export type AuthProviderDto = z.infer<typeof AuthProviderSchema>
