/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiError } from './api-error'

/**
 * Maps an error to an i18n key.
 */
export class ErrorToI18nKeyMapper {
  private foundI18nKey: string | undefined = undefined

  constructor(
    private apiError: Error,
    private i18nNamespace?: string
  ) {}

  public withHttpCode(code: number, i18nKey: string, treatAsAbsoluteKey?: boolean): this {
    if (this.foundI18nKey === undefined && this.apiError instanceof ApiError && this.apiError.statusCode === code) {
      this.foundI18nKey = treatAsAbsoluteKey ? i18nKey : `${this.i18nNamespace ?? ''}.${i18nKey}`
    }
    return this
  }

  public withBackendErrorName(errorName: string, i18nKey: string, treatAsAbsoluteKey?: boolean): this {
    if (
      this.foundI18nKey === undefined &&
      this.apiError instanceof ApiError &&
      this.apiError.backendErrorName === errorName
    ) {
      this.foundI18nKey = treatAsAbsoluteKey ? i18nKey : `${this.i18nNamespace ?? ''}.${i18nKey}`
    }
    return this
  }

  public withErrorMessage(message: string, i18nKey: string, treatAsAbsoluteKey?: boolean): this {
    if (this.foundI18nKey === undefined && this.apiError.message === message) {
      this.foundI18nKey = treatAsAbsoluteKey ? i18nKey : `${this.i18nNamespace ?? ''}.${i18nKey}`
    }
    return this
  }

  public orFallbackI18nKey<T extends string | undefined = string>(
    fallback: T,
    treatAsAbsoluteKey?: boolean
  ): string | T {
    if (this.foundI18nKey) {
      return this.foundI18nKey
    }
    return !treatAsAbsoluteKey && fallback ? `${this.i18nNamespace ?? ''}.${fallback}` : fallback
  }
}
