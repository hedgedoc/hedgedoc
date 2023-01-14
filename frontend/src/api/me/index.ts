/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import { PostApiRequestBuilder } from '../common/api-request-builder/post-api-request-builder'
import type { MediaUpload } from '../media/types'
import type { ChangeDisplayNameDto, LoginUserInfo } from './types'

/**
 * Returns metadata about the currently signed-in user from the API.
 *
 * @return The user metadata.
 * @throws {Error} when the user is not signed-in.
 */
export const getMe = async (): Promise<LoginUserInfo> => {
  const response = await new GetApiRequestBuilder<LoginUserInfo>('me', 'me').sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Deletes the current user from the server.
 *
 * @throws {Error} when the api request wasn't successful.
 */
export const deleteUser = async (): Promise<void> => {
  await new DeleteApiRequestBuilder('me', 'me').sendRequest()
}

/**
 * Changes the display name of the current user.
 *
 * @param displayName The new display name to set.
 * @throws {Error} when the api request wasn't successful.
 */
export const updateDisplayName = async (displayName: string): Promise<void> => {
  await new PostApiRequestBuilder<void, ChangeDisplayNameDto>('me/profile', 'me')
    .withJsonBody({
      displayName
    })
    .sendRequest()
}

/**
 * Retrieves a list of media belonging to the user.
 *
 * @return List of media object information.
 * @throws {Error} when the api request wasn't successful.
 */
export const getMyMedia = async (): Promise<MediaUpload[]> => {
  const response = await new GetApiRequestBuilder<MediaUpload[]>('me/media', 'me').sendRequest()
  return response.asParsedJsonObject()
}
