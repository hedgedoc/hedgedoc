/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'

export const NoteMetadataUpdateSchema = z
  .object({
    title: z
      .string()
      .describe(
        'The new title of the note. Can not contain any markup and might be empty',
      ),
    description: z
      .string()
      .describe(
        'The new description of the note. Can not contain any markup but might be empty.',
      ),
    tags: z.array(z.string()).describe('The new tags for this note.'),
  })
  .describe('DTO for updating the note metadata')

export type NoteMetadataUpdate = z.infer<typeof NoteMetadataUpdateSchema>
