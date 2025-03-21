/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'

export const UserInfoSchema = z
  .object({
    username: z.string().describe("The user's username"),
    displayName: z.string().describe('The display name of the user'),
    photoUrl: z
      .string()
      .url()
      .nullable()
      .describe('The URL to the profile picture of the user'),
  })
  .describe('Represents the public information about a user')

export type UserInfoDto = z.infer<typeof UserInfoSchema>
