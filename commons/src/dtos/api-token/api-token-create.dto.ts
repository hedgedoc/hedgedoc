/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'

const nowPlusTwoYears = (): Date => {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 2)
  return date
}

export const ApiTokenCreateSchema = z
  .object({
    label: z.string().describe('Label for the new token'),
    validUntil: z.coerce
      .date()
      .max(nowPlusTwoYears())
      .describe(
        'Expiry date for the new token. Should be at max two years in the future.',
      ),
  })
  .describe('DTO for creating a new API access token')

export type ApiTokenCreateDto = z.infer<typeof ApiTokenCreateSchema>
