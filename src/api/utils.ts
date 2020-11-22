/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { store } from '../redux'

export const defaultFetchConfig: Partial<RequestInit> = {
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json'
  },
  redirect: 'follow',
  referrerPolicy: 'no-referrer',
  method: 'GET'
}

export const getApiUrl = (): string => {
  return store.getState().apiUrl.apiUrl
}

export const expectResponseCode = (response: Response, code = 200): void => {
  if (response.status !== code) {
    throw new Error(`response code is not ${code}`)
  }
}
