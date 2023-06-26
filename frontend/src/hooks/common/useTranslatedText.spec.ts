/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from './use-translated-text'
import { renderHook } from '@testing-library/react'
import type { Namespace } from 'i18next'
import * as ReactI18NextModule from 'react-i18next'
import type { UseTranslationResponse } from 'react-i18next'
import { Mock } from 'ts-mockery'

jest.mock('react-i18next')

describe('useTranslatedText', () => {
  const mockTranslation = 'mockTranslation'
  const mockKey = 'mockKey'
  let translateFunction: jest.Mock

  beforeEach(() => {
    translateFunction = jest.fn(() => mockTranslation)
    const useTranslateMock = Mock.of<UseTranslationResponse<Namespace, unknown>>({
      t: translateFunction
    })
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
