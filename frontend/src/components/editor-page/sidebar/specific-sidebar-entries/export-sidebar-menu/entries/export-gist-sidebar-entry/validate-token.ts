/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
const GITHUB_CLASSIC_TOKEN_LENGTH = 40
const GITHUB_CLASSIC_TOKEN_PREFIX = 'ghp_'
const GITHUB_SCOPED_TOKEN_LENGTH = 93
const GITHUB_SCOPED_TOKEN_PREFIX = 'github_pat_'

/**
 * Validates a given input to the format of a GitHub personal access token.
 *
 * @param token The input to validate
 * @return true if the input conforms to the format of a GitHub personal access token, false otherwise
 */
export const validateToken = (token: string): boolean => {
  return (
    (token.startsWith(GITHUB_CLASSIC_TOKEN_PREFIX) && token.length === GITHUB_CLASSIC_TOKEN_LENGTH) ||
    (token.startsWith(GITHUB_SCOPED_TOKEN_PREFIX) &&
      token.length === GITHUB_SCOPED_TOKEN_LENGTH &&
      token.charAt(33) === '_')
  )
}
