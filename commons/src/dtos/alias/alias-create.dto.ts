/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const AliasCreateSchema = z
  .object({
    noteIdOrAlias: z
      .string()
      .describe(
        'The note id, which identifies the note the alias should be added to',
      ),
    newAlias: z.string().describe('The new alias'),
  })
  .describe('DTO for creating a new alias')

export type AliasCreateDto = z.infer<typeof AliasCreateSchema>
