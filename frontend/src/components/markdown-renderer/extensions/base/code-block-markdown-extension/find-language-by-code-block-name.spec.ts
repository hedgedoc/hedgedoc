/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { findLanguageByCodeBlockName } from './find-language-by-code-block-name'
import type { LanguageDescription } from '@codemirror/language'
import { Mock } from 'ts-mockery'

describe('filter language name', () => {
  const mockedLanguage1 = Mock.of<LanguageDescription>({ name: 'Mocky', alias: ['mocky'] })
  const mockedLanguage2 = Mock.of<LanguageDescription>({ name: 'Blocky', alias: ['blocky'] })
  const mockedLanguage3 = Mock.of<LanguageDescription>({ name: 'Rocky', alias: ['rocky'] })
  const mockedLanguage4 = Mock.of<LanguageDescription>({ name: 'Zocky', alias: ['zocky'] })
  const mockedLanguages = [mockedLanguage1, mockedLanguage2, mockedLanguage3, mockedLanguage4]

  it('should detect just the name of a language', () => {
    expect(findLanguageByCodeBlockName(mockedLanguages, 'Mocky')).toBe(mockedLanguage1)
  })

  it('should detect the name of a language with parameters', () => {
    expect(findLanguageByCodeBlockName(mockedLanguages, 'Blocky!!!')).toBe(mockedLanguage2)
  })

  it('should detect just the alias of a language', () => {
    expect(findLanguageByCodeBlockName(mockedLanguages, 'rocky')).toBe(mockedLanguage3)
  })

  it('should detect the alias of a language with parameters', () => {
    expect(findLanguageByCodeBlockName(mockedLanguages, 'zocky!!!')).toBe(mockedLanguage4)
  })

  it("shouldn't return a language if no match", () => {
    expect(findLanguageByCodeBlockName(mockedLanguages, 'Docky')).toBe(null)
  })
})
