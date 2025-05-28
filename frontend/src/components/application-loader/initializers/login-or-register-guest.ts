/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { logInGuest, registerGuest } from '../../../api/auth/guest'
import { store } from '../../../redux'
import { fetchAndSetUser } from '../../login-page/utils/fetch-and-set-user'

/**
 * Handles the auth process towards the backend for guests
 * If a user is already logged in, nothing happens.
 * If there is a guest uuid in local storage, the guest with that uuid is logged in.
 * If there is no guest uuid in local storage, a new guest is registered and logged in.
 * The uuid is stored in local storage afterward.
 */
export const loginOrRegisterGuest = async (): Promise<void> => {
  const userState = store.getState().user
  if (userState !== null) {
    return
  }
  const guestUuid = window.localStorage.getItem('guestUuid')
  if (guestUuid === null) {
    const { uuid } = await registerGuest()
    window.localStorage.setItem('guestUuid', uuid)
    return
  }
  await logInGuest(guestUuid)
  await fetchAndSetUser()
}
