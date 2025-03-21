/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const NoteUserPermissionUpdateSchema = z
  .object({
    username: z.string().toLowerCase().describe('The name of the user'),
    canEdit: z.boolean().describe('If the group can edit or only read'),
  })
  .describe('DTO to update the permission of a user.')

export type NoteUserPermissionUpdateDto = z.infer<
  typeof NoteUserPermissionUpdateSchema
>
