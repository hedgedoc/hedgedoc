/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'
import { NoteType } from '../../note-frontmatter/index.js'

export const NoteExploreEntrySchema = z
  .object({
    primaryAlias: z.string().describe('The primary alias of the note'),
    title: z.string().describe('The title of the note'),
    type: z
      .nativeEnum(NoteType)
      .describe('The type of the note (document or slide)'),
    tags: z.array(z.string()).describe('The tags of the note'),
    owner: z.string().nullable().describe('The owner of the note'),
    lastChangedAt: z
      .string()
      .datetime()
      .describe('The last time the note was changed'),
    lastVisitedAt: z
      .string()
      .datetime()
      .nullable()
      .describe('The last time the note was visited by the current user'),
  })
  .describe('DTO for a note entry in the explore page')

export type NoteExploreEntryInterface = z.infer<typeof NoteExploreEntrySchema>
