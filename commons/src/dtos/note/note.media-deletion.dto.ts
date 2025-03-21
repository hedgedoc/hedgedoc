/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const NoteMediaDeletionSchema = z
  .object({
    keepMedia: z
      .boolean()
      .describe(
        'Indicates whether existing media uploads for the note should be kept',
      ),
  })
  .describe(
    'DTO for deleting a note with the option to remove associated uploads as well',
  )

export type NoteMediaDeletionDto = z.infer<typeof NoteMediaDeletionSchema>
