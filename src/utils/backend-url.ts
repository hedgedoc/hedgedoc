/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { isMockMode } from './test-modes'

/**
 * Generates the backend URL from the environment variable `NEXT_PUBLIC_BACKEND_BASE_URL` or the mock default if mock mode is activated.
 *
 * @throws Error if the environment variable is unset or doesn't end with "/"
 * @return the backend url that should be used in the app
 */
const generateBackendUrl = (): string => {
  if (!isMockMode) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL
    if (backendUrl === undefined) {
      throw new Error('NEXT_PUBLIC_BACKEND_BASE_URL is unset and mock mode is disabled')
    } else if (!backendUrl.endsWith('/')) {
      throw new Error("NEXT_PUBLIC_BACKEND_BASE_URL must end with an '/'")
    } else {
      return backendUrl
    }
  } else {
    return '/'
  }
}

export const backendUrl = generateBackendUrl()
