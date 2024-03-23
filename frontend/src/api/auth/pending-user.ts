/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { FullUserInfo } from '../users/types'
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import type { PendingUserConfirmDto } from './types'
import { PutApiRequestBuilder } from '../common/api-request-builder/put-api-request-builder'

/**
 * Fetches the pending user information.
 * @returns The pending user information.
 */
export const getPendingUserInfo = async (): Promise<Partial<FullUserInfo>> => {
  const response = await new GetApiRequestBuilder<Partial<FullUserInfo>>('auth/pending-user').sendRequest()
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
export const confirmPendingUser = async (updatedUserInfo: PendingUserConfirmDto): Promise<void> => {
  await new PutApiRequestBuilder<void, PendingUserConfirmDto>('auth/pending-user')
    .withJsonBody(updatedUserInfo)
    .sendRequest()
}
