/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'
import { EditSchema } from '../edit/edit.dto.js'
import { NoteMetadataSchema } from './note-metadata.dto.js'

export const NoteSchema = z
  .object({
    content: z.string().describe('The markdown content of the note'),
    metadata: NoteMetadataSchema,
    editedByAtPosition: z.array(EditSchema).describe('The edit information '),
  })
  .describe('DTO representing a note')

export type NoteDto = z.infer<typeof NoteSchema>
