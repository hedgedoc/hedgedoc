/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import { PostApiRequestBuilder } from '../common/api-request-builder/post-api-request-builder'
import type { UpdateUserInfoDto, LoginUserInfoDto, MediaUploadDto } from '@hedgedoc/commons'

/**
 * Returns metadata about the currently signed-in user from the API.
 *
 * @return The user metadata.
 * @throws {Error} when the user is not signed-in.
 */
export const getMe = async (): Promise<LoginUserInfoDto> => {
  const response = await new GetApiRequestBuilder<LoginUserInfoDto>('me').sendRequest()
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
  await new PostApiRequestBuilder<void, UpdateUserInfoDto>('me/profile')
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
export const getMyMedia = async (): Promise<MediaUploadDto[]> => {
  const response = await new GetApiRequestBuilder<MediaUploadDto[]>('me/media').sendRequest()
  return response.asParsedJsonObject()
}
