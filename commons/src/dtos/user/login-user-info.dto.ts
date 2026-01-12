/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'
import { AuthProviderType } from '../auth/index.js'
import { UserInfoSchema } from './user-info.dto.js'

export const LoginUserInfoSchema = UserInfoSchema.merge(
  z.object({
    authProvider: z
      .nativeEnum(AuthProviderType)
      .describe('The type of login provider used for the current session'),
    email: z.string().email().nullable().describe('The email address of the user if known'),
  }),
).describe('Information about the user and their auth method for the current session')

export type LoginUserInfoInterface = z.infer<typeof LoginUserInfoSchema>
