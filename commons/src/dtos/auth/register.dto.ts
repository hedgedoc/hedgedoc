/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'
import {
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from '../../constants/index.js'

export const RegisterSchema = z
  .object({
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH)
      .max(MAX_USERNAME_LENGTH)
      .toLowerCase()
      .describe('The new username for local account registration'),
    displayName: z.string().describe('The display name of the new user'),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH)
      .describe('The new password for the local account'),
  })
  .describe('DTO to register a local user account')

export type RegisterInterface = z.infer<typeof RegisterSchema>
