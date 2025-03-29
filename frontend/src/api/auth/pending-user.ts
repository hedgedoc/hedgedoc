/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { FullUserInfoDto } from '@hedgedoc/commons'
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import type { PendingUserConfirmationDto } from '@hedgedoc/commons'
import { PutApiRequestBuilder } from '../common/api-request-builder/put-api-request-builder'

/**
 * Fetches the pending user information.
 * @returns The pending user information.
 */
export const getPendingUserInfo = async (): Promise<FullUserInfoDto> => {
  const response = await new GetApiRequestBuilder<FullUserInfoDto>('auth/pending-user').sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Cancels the pending user.
 */
export const cancelPendingUser = async (): Promise<void> => {
  await new DeleteApiRequestBuilder<void>('auth/pending-user').sendRequest()
}

/**
 * Confirms the pending user with updated user information.
 * @param updatedUserInfo The updated user information.
 */
export const confirmPendingUser = async (updatedUserInfo: PendingUserConfirmationDto): Promise<void> => {
  await new PutApiRequestBuilder<void, PendingUserConfirmationDto>('auth/pending-user')
    .withJsonBody(updatedUserInfo)
    .sendRequest()
}
