/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'

export const UpdateFolderSchema = z.object({
  name: z.string().min(1).max(255).optional().describe('New name for the folder'),
  parentFolderId: z.number().nullable().optional().describe('New parent folder ID to move this folder'),
}).describe('Data to update an existing folder')

export type UpdateFolderInterface = z.infer<typeof UpdateFolderSchema>
