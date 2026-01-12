/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'

export const ApiTokenCreateSchema = z
  .object({
    label: z.string().describe('Label for the new token'),
    validUntil: z
      .string()
      .datetime({ offset: false, precision: 3 })
      .describe('Expiry date for the new token. Should be at max two years in the future.')
      .optional(),
  })
  .describe('DTO for creating a new API access token')

export type ApiTokenCreateInterface = z.infer<typeof ApiTokenCreateSchema>
