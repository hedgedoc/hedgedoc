/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const AliasUpdateSchema = z
  .object({
    primaryAlias: z
      .literal(true)
      .describe('Whether the alias should become the primary alias or not'),
  })
  .describe('DTO for making one alias primary')

export type AliasUpdateDto = z.infer<typeof AliasUpdateSchema>
