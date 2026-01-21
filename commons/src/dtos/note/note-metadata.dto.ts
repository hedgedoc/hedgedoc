/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'
import { NotePermissionsSchema } from '../permissions/index.js'
import { NoteAliasesSchema } from '../alias/note-aliases.dto.js'

export const NoteMetadataSchema = NoteAliasesSchema.merge(
  z.object({
    title: z
      .string()
      .describe('The title of the note. Does not contain any markup but might be empty.'),
    description: z
      .string()
      .describe('The description of the note. Does not contain any markup but might be empty.'),
    tags: z.array(z.string()).describe('List of tags assigned to this note'),
    version: z.number().describe('The HedgeDoc version this note was created in'),
    updatedAt: z
      .string()
      .datetime({ offset: false })
      .describe('The timestamp when the note was last updated'),
    lastUpdatedBy: z.string().nullable().describe('The user that last updated the note'),
    createdAt: z
      .string()
      .datetime({ offset: false })
      .describe('Timestamp when the note was created'),
    editedBy: z.array(z.string()).describe('List of users who edited the note'),
    permissions: NotePermissionsSchema.describe('The permissions of the current note'),
  }),
).describe('The metadata of a note')

export type NoteMetadataInterface = z.infer<typeof NoteMetadataSchema>
