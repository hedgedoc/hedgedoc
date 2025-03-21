/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'

export const UsernameCheckResponseSchema = z
  .object({
    usernameAvailable: z
      .boolean()
      .describe('Whether the chosen username is available or not'),
  })
  .describe('Response to the username check on the register forms')

export type UsernameCheckResponseDto = z.infer<
  typeof UsernameCheckResponseSchema
>
