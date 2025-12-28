/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import { PutApiRequestBuilder } from '../common/api-request-builder/put-api-request-builder'
import type {
  ChangeNoteOwnerInterface,
  ChangeNoteVisibilityInterface,
  NoteGroupPermissionUpdateInterface,
  NotePermissionsInterface,
  NoteUserPermissionUpdateInterface
} from '@hedgedoc/commons'

/**
 * Sets the owner of a note.
 *
 * @param noteId The id of the note.
 * @param newOwner The username of the new owner.
 * @return The updated {@link NotePermissionsInterface}.
 * @throws {Error} when the api request wasn't successful.
 */
export const setNoteOwner = async (noteId: string, newOwner: string): Promise<NotePermissionsInterface> => {
  const response = await new PutApiRequestBuilder<NotePermissionsInterface, ChangeNoteOwnerInterface>(
    `notes/${noteId}/metadata/permissions/owner`
  )
    .withJsonBody({
      owner: newOwner
    })
    .sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Updates the visibility of a note by setting it as public or private.
 *
 * @param noteId - The unique identifier of the note to update.
 * @param publiclyVisible - A flag indicating whether the note should be publicly visible.
 * @returns A promise resolving to the updated permissions metadata for the note.
 */
export const setNotePublic = async (noteId: string, publiclyVisible: boolean): Promise<NotePermissionsInterface> => {
  const response = await new PutApiRequestBuilder<NotePermissionsInterface, ChangeNoteVisibilityInterface>(
    `notes/${noteId}/metadata/permissions/visibility`
  )
    .withJsonBody({
      publiclyVisible: publiclyVisible
    })
    .sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Sets a permission for one user of a note.
 *
 * @param noteId The id of the note.
 * @param username The username of the user to set the permission for.
 * @param canEdit true if the user should be able to update the note, false otherwise.
 * @return The updated {@link NotePermissionsInterface}.
 * @throws {Error} when the api request wasn't successful.
 */
export const setUserPermission = async (
  noteId: string,
  username: string,
  canEdit: boolean
): Promise<NotePermissionsInterface> => {
  const response = await new PutApiRequestBuilder<
    NotePermissionsInterface,
    Pick<NoteUserPermissionUpdateInterface, 'canEdit'>
  >(`notes/${noteId}/metadata/permissions/users/${username}`)
    .withJsonBody({
      canEdit
    })
    .sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Sets a permission for one group of a note.
 *
 * @param noteId The id of the note.
 * @param groupName The name of the group to set the permission for.
 * @param canEdit true if the group should be able to update the note, false otherwise.
 * @return The updated {@link NotePermissionsInterface}.
 * @throws {Error} when the api request wasn't successful.
 */
export const setGroupPermission = async (
  noteId: string,
  groupName: string,
  canEdit: boolean
): Promise<NotePermissionsInterface> => {
  const response = await new PutApiRequestBuilder<
    NotePermissionsInterface,
    Pick<NoteGroupPermissionUpdateInterface, 'canEdit'>
  >(`notes/${noteId}/metadata/permissions/groups/${groupName}`)
    .withJsonBody({
      canEdit
    })
    .sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Removes the permissions of a note for a user.
 *
 * @param noteId The id of the note.
 * @param username The name of the user to remove the permission of.
 * @return The updated {@link NotePermissionsInterface}.
 * @throws {Error} when the api request wasn't successful.
 */
export const removeUserPermission = async (noteId: string, username: string): Promise<NotePermissionsInterface> => {
  const response = await new DeleteApiRequestBuilder<NotePermissionsInterface>(
    `notes/${noteId}/metadata/permissions/users/${username}`
  ).sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Removes the permissions of a note for a group.
 *
 * @param noteId The id of the note.
 * @param groupName The name of the group to remove the permission of.
 * @return The updated {@link NotePermissionsInterface}.
 * @throws {Error} when the api request wasn't successful.
 */
export const removeGroupPermission = async (noteId: string, groupName: string): Promise<NotePermissionsInterface> => {
  const response = await new DeleteApiRequestBuilder<NotePermissionsInterface>(
    `notes/${noteId}/metadata/permissions/groups/${groupName}`
  ).sendRequest()
  return response.asParsedJsonObject()
}
