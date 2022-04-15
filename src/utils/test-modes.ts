/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { isPositiveAnswer } from './is-positive-answer'

/**
 * Checks if the current runtime is built in e2e test mode.
 */
export const isTestMode = !!process.env.NEXT_PUBLIC_TEST_MODE && isPositiveAnswer(process.env.NEXT_PUBLIC_TEST_MODE)

/**
 * Checks if the current runtime should use the mocked backend.
 */
export const isMockMode =
  !!process.env.NEXT_PUBLIC_USE_MOCK_API && isPositiveAnswer(process.env.NEXT_PUBLIC_USE_MOCK_API)

/**
 * Checks if the current runtime was built in development mode.
 */
export const isDevMode = process.env.NODE_ENV === 'development'
