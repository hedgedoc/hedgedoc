/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NotePermissionsDto, SpecialGroup } from '../dtos/index.js'

/**
 * Checks if the given user is the owner of a note.
 *
 * @param permissions The permissions of the note to check
 * @param user The username of the user
 * @return True if the user is the owner of the note
 */
export const userIsOwner = (
  permissions: NotePermissionsDto,
  username: string | null | undefined,
): boolean => {
  return !!username && permissions.owner === username
}

/**
 * Checks if the given user may edit a note.
 *
 * @param permissions The permissions of the note to check
 * @param username The username of the user
 * @return True if the user has the permission to edit the note
 */
export const userCanEdit = (
  permissions: NotePermissionsDto,
  username: string | null | undefined,
): boolean => {
  const isOwner = userIsOwner(permissions, username)
  const mayWriteViaUserPermission = permissions.sharedToUsers.some(
    (value) => value.canEdit && value.username === username,
  )
  const mayWriteViaGroupPermission =
    !!username &&
    permissions.sharedToGroups.some(
      (value) =>
        value.groupName === (SpecialGroup.LOGGED_IN as string) && value.canEdit,
    )
  const everyoneMayWriteViaGroupPermission = permissions.sharedToGroups.some(
    (value) =>
      value.groupName === (SpecialGroup.EVERYONE as string) && value.canEdit,
  )
  return (
    isOwner ||
    mayWriteViaUserPermission ||
    mayWriteViaGroupPermission ||
    everyoneMayWriteViaGroupPermission
  )
}
