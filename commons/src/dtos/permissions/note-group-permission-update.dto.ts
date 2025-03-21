/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const NoteGroupPermissionUpdateSchema = z
  .object({
    groupName: z.string().describe('The name of the group'),
    canEdit: z.boolean().describe('If the group can edit or only read'),
  })
  .describe('DTO to update the permission of a group.')

export type NoteGroupPermissionUpdateDto = z.infer<
  typeof NoteGroupPermissionUpdateSchema
>
