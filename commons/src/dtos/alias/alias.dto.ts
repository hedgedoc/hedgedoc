/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const AliasSchema = z
  .object({
    name: z.string().describe('The name of the alias'),
    primaryAlias: z.boolean().describe('Is the alias the primary alias or not'),
    noteId: z
      .string()
      .describe('The public id of the note the alias is associated with'),
  })
  .describe(
    'The alias of a note. A note can have multiple of these. Only one can be the primary alias.',
  )

export type AliasDto = z.infer<typeof AliasSchema>
