/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { GuestLoginDto } from '@hedgedoc/commons'
import type { GuestRegistrationResponseDto } from '@hedgedoc/commons'
import { PostApiRequestBuilder } from '../common/api-request-builder/post-api-request-builder'

/**
 * Logs in a guest user identified by a uuid
 *
 * @param uuid The uuid of the guest user
 */
export const logInGuest = async (uuid: string): Promise<void> => {
  await new PostApiRequestBuilder<void, GuestLoginDto>('auth/guest/login').withJsonBody({ uuid }).sendRequest()
}

/**
 * Registers a new guest user
 *
 * @return The uuid of the newly created guest user
 */
export const registerGuest = async (): Promise<GuestRegistrationResponseDto> => {
  const response = await new PostApiRequestBuilder<GuestRegistrationResponseDto, void>(
    `auth/guest/register`
  ).sendRequest()
  return await response.asParsedJsonObject()
}
