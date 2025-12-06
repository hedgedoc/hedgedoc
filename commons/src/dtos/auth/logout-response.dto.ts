/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const LogoutResponseSchema = z
  .object({
    redirect: z
      .union([z.string().url(), z.literal('/')])
      .describe('Where the user shall be redirected to after the logout.'),
  })
  .describe('Information the user gets after logging out.')

export type LogoutResponseInterface = z.infer<typeof LogoutResponseSchema>
