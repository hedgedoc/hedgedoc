/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'

/**
 * Requests to log out the current user.
 *
 * @throws {Error} if logout is not possible.
 */
export const doLogout = async (): Promise<void> => {
  await new DeleteApiRequestBuilder('auth/logout').sendRequest()
}
