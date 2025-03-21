/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const NoteUserPermissionEntrySchema = z
  .object({
    username: z.string().describe('The name of the user'),
    canEdit: z.boolean().describe('If the group can edit or only read'),
  })
  .describe('DTO for the permission a group has.')

export type NoteUserPermissionEntryDto = z.infer<
  typeof NoteUserPermissionEntrySchema
>
