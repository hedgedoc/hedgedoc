/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Maps {@link User}s to {@link Group}s
 */
export interface GroupUser {
  /** The id of the {@link Group} a {@link User} is part of */
  [FieldNameGroupUser.groupId]: number;

  /** The id of the {@link User} */
  [FieldNameGroupUser.userId]: number;
}

export enum FieldNameGroupUser {
  groupId = 'group_id',
  userId = 'user_id',
}

export const TableGroupUser = 'group_user';
