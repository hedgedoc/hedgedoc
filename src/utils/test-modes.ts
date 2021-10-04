/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const isTestMode = (): boolean => {
  return !!process.env.REACT_APP_TEST_MODE
}

export const isMockMode = (): boolean => {
  return process.env.REACT_APP_BACKEND_BASE_URL === undefined
}

/**
 * Checks if the current runtime was built in development mode.
 *
 * @return {@code true} if the runtime was built in development mode.
 */
export const isDevMode = (): boolean => {
  return process.env.NODE_ENV === 'development'
}
