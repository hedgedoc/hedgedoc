/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import { PutApiRequestBuilder } from '../common/api-request-builder/put-api-request-builder'
import type {
  ChangeNoteOwnerDto,
  NoteGroupPermissionUpdateDto,
  NotePermissionsDto,
  NoteUserPermissionUpdateDto
} from '@hedgedoc/commons'

/**
 * Sets the owner of a note.
 *
 * @param noteId The id of the note.
 * @param newOwner The username of the new owner.
 * @return The updated {@link NotePermissionsDto}.
 * @throws {Error} when the api request wasn't successful.
 */
export const setNoteOwner = async (noteId: string, newOwner: string): Promise<NotePermissionsDto> => {
  const response = await new PutApiRequestBuilder<NotePermissionsDto, ChangeNoteOwnerDto>(
    `notes/${noteId}/metadata/permissions/owner`
  )
    .withJsonBody({
      owner: newOwner
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
 * @return The updated {@link NotePermissionsDto}.
 * @throws {Error} when the api request wasn't successful.
 */
export const setUserPermission = async (
  noteId: string,
  username: string,
  canEdit: boolean
): Promise<NotePermissionsDto> => {
  const response = await new PutApiRequestBuilder<NotePermissionsDto, Pick<NoteUserPermissionUpdateDto, 'canEdit'>>(
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
 * @return The updated {@link NotePermissionsDto}.
 * @throws {Error} when the api request wasn't successful.
 */
export const setGroupPermission = async (
  noteId: string,
  groupName: string,
  canEdit: boolean
): Promise<NotePermissionsDto> => {
  const response = await new PutApiRequestBuilder<NotePermissionsDto, Pick<NoteGroupPermissionUpdateDto, 'canEdit'>>(
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
 * @return The updated {@link NotePermissionsDto}.
 * @throws {Error} when the api request wasn't successful.
 */
export const removeUserPermission = async (noteId: string, username: string): Promise<NotePermissionsDto> => {
  const response = await new DeleteApiRequestBuilder<NotePermissionsDto>(
    `notes/${noteId}/metadata/permissions/users/${username}`
  ).sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Removes the permissions of a note for a group.
 *
 * @param noteId The id of the note.
 * @param groupName The name of the group to remove the permission of.
 * @return The updated {@link NotePermissionsDto}.
 * @throws {Error} when the api request wasn't successful.
 */
export const removeGroupPermission = async (noteId: string, groupName: string): Promise<NotePermissionsDto> => {
  const response = await new DeleteApiRequestBuilder<NotePermissionsDto>(
    `notes/${noteId}/metadata/permissions/groups/${groupName}`
  ).sendRequest()
  return response.asParsedJsonObject()
}
