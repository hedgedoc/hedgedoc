/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const UpdateUserInfoSchema = z
  .object({
    displayName: z
      .string()
      .nullable()
      .describe('The new display name of the user.'),
    email: z.string().email().nullable().describe('The new email of the user.'),
  })
  .describe('The update of a user profile.')

export type UpdateUserInfoDto = z.infer<typeof UpdateUserInfoSchema>
