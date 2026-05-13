/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DateTime } from 'luxon'

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly backendErrorName?: string,
    public readonly backendErrorMessage?: string
  ) {
    super()
  }
}

export class RateLimitError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super()
  }

  getResetIn(): string {
    return DateTime.local().plus({ seconds: this.retryAfterSeconds }).toRelative()
  }
}
