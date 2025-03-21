/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface NotePermissions {
  owner: string | null
  sharedToUsers: NoteUserPermissionEntry[]
  sharedToGroups: NoteGroupPermissionEntry[]
}

export interface NoteUserPermissionEntry {
  username: string
  canEdit: boolean
}

export interface NoteGroupPermissionEntry {
  groupName: string
  canEdit: boolean
}
export enum AccessLevel {
  NONE,
  READ_ONLY,
  WRITEABLE,
}

export enum SpecialGroup {
  EVERYONE = '_EVERYONE',
  LOGGED_IN = '_LOGGED_IN',
}
