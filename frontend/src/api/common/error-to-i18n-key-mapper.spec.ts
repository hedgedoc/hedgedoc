/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiError } from './api-error'
import { ErrorToI18nKeyMapper } from './error-to-i18n-key-mapper'

describe('ErrorToI18nKeyMapper', () => {
  it('returns fallback with namespace when no mapper is defined', () => {
    const mapper = new ErrorToI18nKeyMapper(new Error('test'), 'namespace')
    const result = mapper.orFallbackI18nKey('fallback')
    expect(result).toEqual('namespace.fallback')
  })

  it('returns fallback without namespace when no mapper is defined and absolute key should be used', () => {
    const mapper = new ErrorToI18nKeyMapper(new Error('test'), 'namespace')
    const result = mapper.orFallbackI18nKey('fallback', true)
    expect(result).toEqual('fallback')
  })

  it('returns undefined when no mapper is defined and no fallback defined', () => {
    const mapper = new ErrorToI18nKeyMapper(new Error('test'), 'namespace')
    const result = mapper.orFallbackI18nKey(undefined)
    expect(result).toEqual(undefined)
  })

  it('maps an error by its error message to an i18n key', () => {
    const mapper = new ErrorToI18nKeyMapper(new Error('test'), 'namespace')
    const result = mapper
      .withBackendErrorName('BackendError', 'backendError')
      .withErrorMessage('test', 'testError')
      .withHttpCode(418, 'teapot')
      .orFallbackI18nKey('fallback')
    expect(result).toEqual('namespace.testError')
  })

  it('maps an API error by its error name to an i18n key', () => {
    const mapper = new ErrorToI18nKeyMapper(new ApiError(500, 'BackendError'), 'namespace')
    const result = mapper
      .withBackendErrorName('BackendError', 'backendError')
      .withErrorMessage('test', 'testError')
      .withHttpCode(418, 'teapot')
      .orFallbackI18nKey('fallback')
    expect(result).toEqual('namespace.backendError')
  })

  it('maps an API error by its status code to an i18n key', () => {
    const mapper = new ErrorToI18nKeyMapper(new ApiError(418, 'Coffee'), 'namespace')
    const result = mapper
      .withBackendErrorName('BackendError', 'backendError')
      .withErrorMessage('test', 'testError')
      .withHttpCode(418, 'teapot')
      .orFallbackI18nKey('fallback')
    expect(result).toEqual('namespace.teapot')
  })
})
