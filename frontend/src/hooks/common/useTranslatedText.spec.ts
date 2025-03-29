/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from './use-translated-text'
import { renderHook } from '@testing-library/react'
import * as ReactI18NextModule from 'react-i18next'
import { Mock } from 'ts-mockery'
import type { UseTranslationResponse } from 'react-i18next'

jest.mock('react-i18next')

describe('useTranslatedText', () => {
  const mockTranslation = 'mockTranslation'
  const mockKey = 'mockKey'
  const translateFunction = jest.fn(() => mockTranslation)

  beforeEach(() => {
    const useTranslateMock = Mock.of({
      t: translateFunction
    }) as unknown as UseTranslationResponse<never, never>
    jest.spyOn(ReactI18NextModule, 'useTranslation').mockReturnValue(useTranslateMock)
  })

  it('translates text', () => {
    const { result } = renderHook(() => useTranslatedText(mockKey))

    expect(result.current).toBe(mockTranslation)
    expect(translateFunction).toBeCalledWith(mockKey)
  })

  it('translates text with options', () => {
    const mockOptions = {}
    const { result } = renderHook(() => useTranslatedText(mockKey, mockOptions))

    expect(result.current).toBe(mockTranslation)
    expect(translateFunction).toBeCalledWith(mockKey, mockOptions)
  })
})
