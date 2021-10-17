/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { UserInfoDto } from '../users/types'
import type { GroupInfoDto } from '../group/types'

export interface NoteDto {
  content: string
  metadata: NoteMetadataDto
  editedByAtPosition: NoteAuthorshipDto[]
}

export interface NoteMetadataDto {
  id: string
  alias: string
  version: number
  title: string
  description: string
  tags: string[]
  updateTime: string
  updateUser: UserInfoDto
  viewCount: number
  createTime: string
  editedBy: string[]
  permissions: NotePermissionsDto
}

export interface NoteAuthorshipDto {
  userName: string
  startPos: number
  endPos: number
  createdAt: string
  updatedAt: string
}

export interface NotePermissionsDto {
  owner: UserInfoDto
  sharedToUsers: NoteUserPermissionEntryDto[]
  sharedToGroups: NoteGroupPermissionEntryDto[]
}

export interface NoteUserPermissionEntryDto {
  user: UserInfoDto
  canEdit: boolean
}

export interface NoteGroupPermissionEntryDto {
  group: GroupInfoDto
  canEdit: boolean
}
