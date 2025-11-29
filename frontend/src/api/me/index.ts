/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import type { UpdateUserInfoInterface, LoginUserInfoInterface, MediaUploadInterface, NoteMetadataInterface } from '@hedgedoc/commons'
import { PutApiRequestBuilder } from '../common/api-request-builder/put-api-request-builder'

/**
 * Returns metadata about the currently signed-in user from the API.
 *
 * @return The user metadata.
 * @throws {Error} when the user is not signed-in.
 */
export const getMe = async (): Promise<LoginUserInfoInterface> => {
  const response = await new GetApiRequestBuilder<LoginUserInfoInterface>('me').sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Deletes the current user from the server.
 *
 * @throws {Error} when the api request wasn't successful.
 */
export const deleteUser = async (): Promise<void> => {
  await new DeleteApiRequestBuilder('me').sendRequest()
}

/**
 * Changes the display name of the current user.
 *
 * @param displayName The new display name to set.
 * @param email The new email to set.
 * @throws {Error} when the api request wasn't successful.
 */
export const updateUser = async (displayName: string | null, email: string | null): Promise<void> => {
  await new PutApiRequestBuilder<void, UpdateUserInfoInterface>('me/profile')
    .withJsonBody({
      displayName,
      email
    })
    .sendRequest()
}

/**
 * Retrieves a list of media belonging to the user.
 *
 * @return List of media object information.
 * @throws {Error} when the api request wasn't successful.
 */
export const getMyMedia = async (): Promise<MediaUploadInterface[]> => {
  const response = await new GetApiRequestBuilder<MediaUploadInterface[]>('me/media').sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Retrieves a list of notes owned by the user.
 *
 * @return List of note metadata.
 * @throws {Error} when the api request wasn't successful.
 */
export const getMyNotes = async (): Promise<NoteMetadataInterface[]> => {
  const response = await new GetApiRequestBuilder<NoteMetadataInterface[]>('me/notes').sendRequest()
  return response.asParsedJsonObject()
}
