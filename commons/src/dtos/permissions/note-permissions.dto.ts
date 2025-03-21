/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'
import { NoteUserPermissionEntrySchema } from './note-user-permission-entry.dto.js'
import { NoteGroupPermissionEntrySchema } from './note-group-permission-entry.dto.js'

export const NotePermissionsSchema = z
  .object({
    owner: z.string().nullable().describe('Username of the owner of the note'),
    sharedToUsers: z
      .array(NoteUserPermissionEntrySchema)
      .describe('List of users the note is shared with'),
    sharedToGroups: z
      .array(NoteGroupPermissionEntrySchema)
      .describe('List of groups that the note is shared with'),
  })
  .describe('Represents the permissions of a note')

export type NotePermissionsDto = z.infer<typeof NotePermissionsSchema>
