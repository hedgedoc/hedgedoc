/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'

export const NoteAliasesSchema = z
  .object({
    aliases: z.array(z.string()).describe('All aliases of the note'),
    primaryAlias: z.string().describe('The primary address/alias of the note.'),
  })
  .describe('Information about the aliases of the note.')

export type NoteAliasesInterface = z.infer<typeof NoteAliasesSchema>
