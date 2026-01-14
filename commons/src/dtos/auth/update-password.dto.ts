/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'
import { MIN_PASSWORD_LENGTH } from '../../constants/index.js'

export const UpdatePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH)
      .describe('The current password of the user'),
    newPassword: z.string().min(MIN_PASSWORD_LENGTH).describe('The new password of the user'),
  })
  .describe('DTO to update the password of a local user account')

export type UpdatePasswordInterface = z.infer<typeof UpdatePasswordSchema>
