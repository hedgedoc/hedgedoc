/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly backendErrorName: string | undefined,
    public readonly backendErrorMessage: string | undefined
  ) {
    super()
  }
}
