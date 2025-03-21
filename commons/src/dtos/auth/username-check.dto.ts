/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'

export const UsernameCheckSchema = z
  .object({
    username: z
      .string()
      .toLowerCase()
      .describe("The username the user want's to register"),
  })
  .describe('DTO to check if a username is available')

export type UsernameCheckDto = z.infer<typeof UsernameCheckSchema>
