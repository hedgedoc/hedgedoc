/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiError } from './api-error'

export class ErrorToI18nKeyMapper {
  private foundI18nKey: string | undefined = undefined

  constructor(private apiError: Error, private i18nNamespace?: string) {}

  public withHttpCode(code: number, i18nKey: string): this {
    if (this.foundI18nKey === undefined && this.apiError instanceof ApiError && this.apiError.statusCode === code) {
      this.foundI18nKey = i18nKey
    }
    return this
  }

  public withBackendErrorName(errorName: string, i18nKey: string): this {
    if (
      this.foundI18nKey === undefined &&
      this.apiError instanceof ApiError &&
      this.apiError.apiErrorName === errorName
    ) {
      this.foundI18nKey = i18nKey
    }
    return this
  }

  public withErrorMessage(message: string, i18nKey: string): this {
    if (this.foundI18nKey === undefined && this.apiError.message === message) {
      this.foundI18nKey = i18nKey
    }
    return this
  }

  public orFallbackI18nKey(fallback?: string): typeof fallback {
    const foundValue = this.foundI18nKey ?? fallback
    if (foundValue !== undefined && this.i18nNamespace !== undefined) {
      return `${this.i18nNamespace}.${foundValue}`
    } else {
      return foundValue
    }
  }
}
