/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'
import { ProviderType } from '../auth/index.js'
import { FullUserInfoSchema } from './full-user-info.dto.js'

export const LoginUserInfoSchema = FullUserInfoSchema.merge(
  z.object({
    authProvider: z
      .nativeEnum(ProviderType)
      .describe('The type of login provider used for the current session'),
  }),
).describe(
  'Information about the user and their auth method for the current session',
)

export type LoginUserInfoDto = z.infer<typeof LoginUserInfoSchema>
