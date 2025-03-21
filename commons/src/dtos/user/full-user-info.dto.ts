/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'
import { UserInfoSchema } from './user-info.dto.js'

export const FullUserInfoSchema = UserInfoSchema.merge(
  z.object({
    email: z
      .string()
      .email()
      .nullable()
      .describe('The email address of the user if known'),
  }),
).describe(
  'The full user information is only presented to the logged in user itself. For privacy reasons the email address is only here',
)

export type FullUserInfoDto = z.infer<typeof FullUserInfoSchema>
