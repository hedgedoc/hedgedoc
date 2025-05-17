/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export enum SpecialGroup {
  EVERYONE = '_EVERYONE',
  LOGGED_IN = '_LOGGED_IN',
}

/**
 * A group represents one or multiple {@link User}s and can be used for permission management.
 * There are special groups that are created by the system and cannot be deleted, these include the set of all
 * registered users, as well as all unauthenticated users.
 */
export interface Group {
  /** The unique id for internal referencing */
  [FieldNameGroup.id]: number

  /** The public identifier of the group (username for the group) */
  [FieldNameGroup.name]: string

  /** The display name of the group */
  [FieldNameGroup.displayName]: string

  /** Whether the group is one of the special groups */
  [FieldNameGroup.isSpecial]: boolean
}

export enum FieldNameGroup {
  id = 'id',
  name = 'name',
  displayName = 'display_name',
  isSpecial = 'is_special',
}

export const TableGroup = 'group'
export type TypeInsertGroup = Omit<Group, FieldNameGroup.id>
export type TypeUpdateGroup = Pick<
  Group,
  FieldNameGroup.name | FieldNameGroup.displayName
>
