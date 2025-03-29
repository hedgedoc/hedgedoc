/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PostApiRequestBuilder } from '../common/api-request-builder/post-api-request-builder'
import { PutApiRequestBuilder } from '../common/api-request-builder/put-api-request-builder'
import type { UpdatePasswordDto, LoginDto, RegisterDto } from '@hedgedoc/commons'

/**
 * Requests to do a local login with a provided username and password.
 *
 * @param username The username for which the login should be tried.
 * @param password The password which should be used to log in.
 * @throws {AuthError.INVALID_CREDENTIALS} when the username or password is wrong.
 * @throws {AuthError.LOGIN_DISABLED} when the local login is disabled on the backend.
 * @throws {Error} when the api request wasn't successful.
 */
export const doLocalLogin = async (username: string, password: string): Promise<void> => {
  await new PostApiRequestBuilder<void, LoginDto>('auth/local/login')
    .withJsonBody({
      username,
      password
    })
    .sendRequest()
}

/**
 * Requests to register a new local user in the backend.
 *
 * @param username The username of the new user.
 * @param displayName The display name of the new user.
 * @param password The password of the new user.
 * @throws {RegisterError.PASSWORD_TOO_WEAK} when the backend deems the password too weak.
 * @throws {RegisterError.USERNAME_EXISTING} when there is already an existing user with the same username.
 * @throws {RegisterError.REGISTRATION_DISABLED} when the registration of local users has been disabled on the backend.
 * @throws {Error} when the api request wasn't successful.
 */
export const doLocalRegister = async (username: string, displayName: string, password: string): Promise<void> => {
  await new PostApiRequestBuilder<void, RegisterDto>('auth/local')
    .withJsonBody({
      username,
      displayName,
      password
    })
    .sendRequest()
}

/**
 * Requests to update the user's current password to a new one.
 * @param currentPassword The current password of the user for confirmation.
 * @param newPassword The new password of the user.
 * @throws {AuthError.INVALID_CREDENTIALS} when the current password is wrong.
 * @throws {AuthError.LOGIN_DISABLED} when local login is disabled on the backend.
 */
export const doLocalPasswordChange = async (currentPassword: string, newPassword: string): Promise<void> => {
  await new PutApiRequestBuilder<void, UpdatePasswordDto>('auth/local')
    .withJsonBody({
      currentPassword,
      newPassword
    })
    .sendRequest()
}
