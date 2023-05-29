/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * This file is intentionally a js and not a ts file because it is used in `next.config.js`
 */

/**
 * Checks if the given string is a positive answer (yes, true or 1).
 *
 * @param {string} value The value to check
 * @return {boolean} {@code true} if the value describes a positive answer string
 */
const isPositiveAnswer = (value) => {
  const lowerValue = value.toLowerCase()
  return lowerValue === 'yes' || lowerValue === '1' || lowerValue === 'true'
}

/**
 * Defines if the current runtime is built in e2e test mode.
 * @type boolean
 */
const isTestMode = !!process.env.NEXT_PUBLIC_TEST_MODE && isPositiveAnswer(process.env.NEXT_PUBLIC_TEST_MODE)

/**
 * Defines if the current runtime should use the mocked backend.
 * @type boolean
 */
const isMockMode = !!process.env.NEXT_PUBLIC_USE_MOCK_API && isPositiveAnswer(process.env.NEXT_PUBLIC_USE_MOCK_API)

/**
 * Defines if the current runtime was built in development mode.
 * @type boolean
 */
const isDevMode = process.env.NODE_ENV === 'development'

/**
 * Defines if the current runtime contains the bundle analyzer and profiling metrics.
 * @type boolean
 */
const isProfilingMode = !!process.env.ANALYZE && isPositiveAnswer(process.env.ANALYZE)

/**
 * Defines if the currently running process is building or executing.
 *
 * @type boolean
 */
const isBuildTime = !!process.env.BUILD_TIME && isPositiveAnswer(process.env.BUILD_TIME)

module.exports = {
  isTestMode,
  isMockMode,
  isDevMode,
  isProfilingMode,
  isBuildTime
}
