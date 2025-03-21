/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'
import { AliasSchema } from '../alias/index.js'
import { NotePermissionsSchema } from '../permissions/index.js'

export const NoteMetadataSchema = z
  .object({
    id: z.string().describe('The id of the note'),
    aliases: z.array(AliasSchema).describe('All aliases of the note'),
    primaryAddress: z
      .string()
      .describe(
        'The primary address/alias of the note. If at least one alias is set, this is the primary alias.',
      ),
    title: z
      .string()
      .describe(
        'The title of the note. Does not contain any markup but might be empty.',
      ),
    description: z
      .string()
      .describe(
        'The description of the note. Does not contain any markup but might be empty.',
      ),
    tags: z.array(z.string()).describe('List of tags assigned to this note'),
    version: z
      .number()
      .describe('The HedgeDoc version this note was created in'),
    updatedAt: z
      .string()
      .datetime()
      .describe('The timestamp when the note was last updated'),
    updateUsername: z
      .string()
      .nullable()
      .describe('The user that last updated the note'),
    viewCount: z
      .number()
      .describe('Counts how many times the note has been viewed'),
    createdAt: z
      .string()
      .datetime()
      .describe('Timestamp when the note was created'),
    editedBy: z.array(z.string()).describe('List of users who edited the note'),
    permissions: NotePermissionsSchema.describe(
      'The permissions of the current note',
    ),
  })
  .describe('The metadata of a note')

export type NoteMetadataDto = z.infer<typeof NoteMetadataSchema>
