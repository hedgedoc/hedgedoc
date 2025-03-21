/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'

export const LoginSchema = z
  .object({
    username: z
      .string()
      .toLowerCase()
      .describe('The username to log in with local authentication'),
    password: z
      .string()
      .describe('The password to log in with local authentication'),
  })
  .describe('DTO for the login form of local accounts')

export type LoginDto = z.infer<typeof LoginSchema>
