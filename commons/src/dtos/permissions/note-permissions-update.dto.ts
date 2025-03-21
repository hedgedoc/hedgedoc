/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'
import { NoteUserPermissionUpdateSchema } from './note-user-permission-update.dto.js'
import { NoteGroupPermissionUpdateSchema } from './note-group-permission-update.dto.js'

export const NotePermissionsUpdateSchema = z
  .object({
    sharedToUsers: z
      .array(NoteUserPermissionUpdateSchema)
      .describe('List of users the note is shared with'),
    sharedToGroups: z
      .array(NoteGroupPermissionUpdateSchema)
      .describe('List of groups that the note is shared with'),
  })
  .describe('DTO to update the permissions of a note.')

export type NotePermissionsUpdateDto = z.infer<
  typeof NotePermissionsUpdateSchema
>
