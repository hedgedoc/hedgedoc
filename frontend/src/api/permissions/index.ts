/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import { PutApiRequestBuilder } from '../common/api-request-builder/put-api-request-builder'
import type { NotePermissions } from '../notes/types'
import type { OwnerChangeDto, PermissionSetDto } from './types'

/**
 * Sets the owner of a note.
 *
 * @param noteId The id of the note.
 * @param owner The username of the new owner.
 * @return The updated {@link NotePermissions}.
 * @throws {Error} when the api request wasn't successful.
 */
export const setNoteOwner = async (noteId: string, owner: string): Promise<NotePermissions> => {
  const response = await new PutApiRequestBuilder<NotePermissions, OwnerChangeDto>(
    `notes/${noteId}/metadata/permissions/owner`
  )
    .withJsonBody({
      owner
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
 * @return The updated {@link NotePermissions}.
 * @throws {Error} when the api request wasn't successful.
 */
export const setUserPermission = async (
  noteId: string,
  username: string,
  canEdit: boolean
): Promise<NotePermissions> => {
  const response = await new PutApiRequestBuilder<NotePermissions, PermissionSetDto>(
    `notes/${noteId}/metadata/permissions/users/${username}`
  )
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
 * @return The updated {@link NotePermissions}.
 * @throws {Error} when the api request wasn't successful.
 */
export const setGroupPermission = async (
  noteId: string,
  groupName: string,
  canEdit: boolean
): Promise<NotePermissions> => {
  const response = await new PutApiRequestBuilder<NotePermissions, PermissionSetDto>(
    `notes/${noteId}/metadata/permissions/groups/${groupName}`
  )
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
 * @return The updated {@link NotePermissions}.
 * @throws {Error} when the api request wasn't successful.
 */
export const removeUserPermission = async (noteId: string, username: string): Promise<NotePermissions> => {
  const response = await new DeleteApiRequestBuilder<NotePermissions>(
    `notes/${noteId}/metadata/permissions/users/${username}`
  ).sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Removes the permissions of a note for a group.
 *
 * @param noteId The id of the note.
 * @param groupName The name of the group to remove the permission of.
 * @return The updated {@link NotePermissions}.
 * @throws {Error} when the api request wasn't successful.
 */
export const removeGroupPermission = async (noteId: string, groupName: string): Promise<NotePermissions> => {
  const response = await new DeleteApiRequestBuilder<NotePermissions>(
    `notes/${noteId}/metadata/permissions/groups/${groupName}`
  ).sendRequest()
  return response.asParsedJsonObject()
}
