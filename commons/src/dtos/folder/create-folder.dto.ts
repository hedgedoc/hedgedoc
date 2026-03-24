/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'

export const CreateFolderSchema = z.object({
  name: z.string().min(1).max(255).describe('Name of the new folder'),
  parentFolderId: z.number().nullable().optional().describe('ID of the parent folder, if any'),
}).describe('Data to create a new folder')

export type CreateFolderInterface = z.infer<typeof CreateFolderSchema>
