/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'
import { RevisionMetadataSchema } from './revision-metadata.dto.js'

export const RevisionSchema = RevisionMetadataSchema.pick({
  uuid: true,
  length: true,
  createdAt: true,
  title: true,
  description: true,
})
  .merge(
    z.object({
      content: z.string().describe('The content of the revision'),
      patch: z.string().describe('The patch or diff to the previous revision'),
    }),
  )
  .describe(
    'A revision is the state of a note content at a specific time. This is used to go back to previous version of a note.',
  )

export type RevisionDto = z.infer<typeof RevisionSchema>
