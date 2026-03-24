/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'

export const FolderSchema = z.object({
  id: z.number().describe('The ID of the folder'),
  name: z.string().describe('The name of the folder'),
  ownerId: z.number().describe('The ID of the owner of the folder'),
  parentFolderId: z.number().nullable().describe('The ID of the parent folder, if any'),
  createdAt: z.string().datetime({ offset: false }).describe('When the folder was created'),
}).describe('A folder used to organize notes')

export type FolderInterface = z.infer<typeof FolderSchema>
