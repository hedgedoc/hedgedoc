/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Folders provide a way to organize notes in a hierarchical structure.
 * They belong to a specific user (owner) and can optionally reside within another folder.
 */
export interface Folder {
  /** The unique id of the folder */
  [FieldNameFolder.id]: number

  /** The name of the folder */
  [FieldNameFolder.name]: string

  /** The {@link User} id of the folder owner */
  [FieldNameFolder.ownerId]: number

  /** The ID of the parent folder, if this folder is nested */
  [FieldNameFolder.parentFolderId]: number | null

  /** Timestamp when the folder was created */
  [FieldNameFolder.createdAt]: string
}

export enum FieldNameFolder {
  id = 'id',
  name = 'name',
  ownerId = 'owner_id',
  parentFolderId = 'parent_folder_id',
  createdAt = 'created_at',
}

export const TableFolder = 'folder'

export type TypeInsertFolder = Omit<Folder, FieldNameFolder.id>
export type TypeUpdateFolder =
  | Pick<Folder, FieldNameFolder.name>
  | Pick<Folder, FieldNameFolder.parentFolderId>
