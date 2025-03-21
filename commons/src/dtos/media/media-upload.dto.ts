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
    noteId: z
      .string()
      .nullable()
      .describe('The note id to which the uploaded file is linked to'),
    createdAt: z
      .string()
      .datetime()
      .describe('The dater when the upload was created'),
    username: z
      .string()
      .nullable()
      .describe('The username which uploaded the file'),
  })
  .describe('Metadata for an uploaded file')

export type MediaUploadDto = z.infer<typeof MediaUploadSchema>
