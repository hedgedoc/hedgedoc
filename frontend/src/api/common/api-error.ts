/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    statusText: string,
    i18nNamespace: string,
    public readonly apiErrorName: string | undefined
  ) {
    super(`api.error.${i18nNamespace}.${statusText}`)
  }
}
