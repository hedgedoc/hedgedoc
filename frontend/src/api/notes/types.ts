/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Alias } from '../alias/types'

export interface Note {
  content: string
  metadata: NoteMetadata
  editedByAtPosition: NoteEdit[]
}

export interface NoteMetadata {
  id: string
  aliases: Alias[]
  primaryAddress: string
  title: string
  description: string
  tags: string[]
  updatedAt: string
  updateUsername: string | null
  viewCount: number
  createdAt: string
  editedBy: string[]
  permissions: NotePermissions
  version: number
}

export interface NoteEdit {
  username: string | null
  startPos: number
  endPos: number
  createdAt: string
  updatedAt: string
}

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

export interface NoteDeletionOptions {
  keepMedia: boolean
}
