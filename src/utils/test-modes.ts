/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Checks if the current runtime is built in e2e test mode.
 */
export const isTestMode = (): boolean => {
  return process.env.NEXT_PUBLIC_TEST_MODE === 'true'
}

/**
 * Checks if the current runtime should use the mocked backend.
 */
export const isMockMode = (): boolean => {
  return process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
}

/**
 * Checks if the current runtime was built in development mode.
 */
export const isDevMode = (): boolean => {
  return process.env.NODE_ENV === 'development'
}
