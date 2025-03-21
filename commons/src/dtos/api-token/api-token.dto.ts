/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const ApiTokenSchema = z
  .object({
    label: z.string().describe('The label of the token'),
    keyId: z.string().describe('The id of the token'),
    createdAt: z.string().datetime().describe('When this token was created'),
    validUntil: z
      .string()
      .datetime()
      .describe('How long this token is valid fro'),
    lastUsedAt: z
      .string()
      .datetime()
      .nullable()
      .describe('When this token was last used'),
  })
  .describe(
    'Represents an access token for the public API. Each API token is bound to a user account. A user can have multiple API tokens.',
  )

export type ApiTokenDto = z.infer<typeof ApiTokenSchema>
