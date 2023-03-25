/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { findRegexMatchInText } from './find-regex-match-in-text'

describe('find regex index in line', function () {
  it('finds the first occurrence', () => {
    const result = findRegexMatchInText('aba', /a/g, 0)
    expect(result).toBeDefined()
    expect(result).toHaveLength(1)
    expect((result as RegExpMatchArray).index).toBe(0)
  })

  it('finds another occurrence', () => {
    const result = findRegexMatchInText('aba', /a/g, 1)
    expect(result).toBeDefined()
    expect(result).toHaveLength(1)
    expect((result as RegExpMatchArray).index).toBe(2)
  })

  it('fails to find with a wrong regex', () => {
    const result = findRegexMatchInText('aba', /c/g, 0)
    expect(result).not.toBeDefined()
  })

  it('fails to find with a negative wanted index', () => {
    const result = findRegexMatchInText('aba', /a/g, -1)
    expect(result).not.toBeDefined()
  })

  it('fails to find if the index is to high', () => {
    const result = findRegexMatchInText('aba', /a/g, 100)
    expect(result).not.toBeDefined()
  })
})
