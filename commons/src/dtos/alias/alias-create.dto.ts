/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const AliasCreateSchema = z
  .object({
    noteAlias: z
      .string()
      .describe(
        'An existing note alias identifying the note for which the alias should be added to',
      ),
    newAlias: z.string().describe('The new alias'),
  })
  .describe('DTO for creating a new alias')

export type AliasCreateInterface = z.infer<typeof AliasCreateSchema>
