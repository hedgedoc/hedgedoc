/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const GuestLoginSchema = z
  .object({
    uuid: z.string().uuid().describe('The uuid of the guest.'),
  })
  .describe('DTO to login as a guest user.')

export type GuestLoginDto = z.infer<typeof GuestLoginSchema>
