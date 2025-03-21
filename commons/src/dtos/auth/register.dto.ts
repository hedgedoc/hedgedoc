/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'

export const RegisterSchema = z
  .object({
    username: z
      .string()
      .min(3)
      .max(64)
      .toLowerCase()
      .describe('The new username for local account registration'),
    displayName: z.string().describe('The display name of the new user'),
    password: z
      .string()
      .min(6)
      .describe('The new password for the local account'),
  })
  .describe('DTO to register a local user account')

export type RegisterDto = z.infer<typeof RegisterSchema>
