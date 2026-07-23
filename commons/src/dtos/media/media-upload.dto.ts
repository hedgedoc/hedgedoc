/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const MediaUploadSchema = z
  .object({
    uuid: z.string().uuid().describe('The uuid of the media file'),
    fileName: z.string().describe('The original filename of the media upload'),
    linkedNoteCount: z
      .number()
      .int()
      .nonnegative()
      .describe('How many notes are linked to the upload'),
    createdAt: z
      .string()
      .datetime({ offset: false, local: false })
      .describe('The dater when the upload was created'),
    username: z.string().nullable().describe('The username which uploaded the file'),
  })
  .describe('Metadata for an uploaded file')

export type MediaUploadInterface = z.infer<typeof MediaUploadSchema>
