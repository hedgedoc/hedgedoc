/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { QuoteExtraTagValues } from './parse-blockquote-extra-tag'
import { parseBlockquoteExtraTag } from './parse-blockquote-extra-tag'

describe('Quote extra syntax parser', () => {
  it('should parse a valid tag', () => {
    const expected: QuoteExtraTagValues = {
      labelStartIndex: 1,
      labelEndIndex: 4,
      valueStartIndex: 5,
      valueEndIndex: 8,
      label: 'abc',
      value: 'def'
    }
    expect(parseBlockquoteExtraTag('[abc=def]', 0, 1000)).toEqual(expected)
  })

  it("shouldn't parse a tag with no opener bracket", () => {
    expect(parseBlockquoteExtraTag('abc=def]', 0, 1000)).toEqual(undefined)
  })

  it("shouldn't parse a tag with no closing bracket", () => {
    expect(parseBlockquoteExtraTag('[abc=def', 0, 1000)).toEqual(undefined)
  })

  it("shouldn't parse a tag with no separation character", () => {
    expect(parseBlockquoteExtraTag('[abcdef]', 0, 1000)).toEqual(undefined)
  })

  it("shouldn't parse a tag with an empty label", () => {
    expect(parseBlockquoteExtraTag('[=def]', 0, 1000)).toEqual(undefined)
  })

  it("shouldn't parse a tag with an empty value", () => {
    expect(parseBlockquoteExtraTag('[abc=]', 0, 1000)).toEqual(undefined)
  })

  it("shouldn't parse a tag with an empty body", () => {
    expect(parseBlockquoteExtraTag('[]', 0, 1000)).toEqual(undefined)
  })

  it("shouldn't parse a tag with an empty body", () => {
    expect(parseBlockquoteExtraTag('[]', 0, 1000)).toEqual(undefined)
  })

  it("shouldn't parse a correct tag if start index isn't at the opening bracket", () => {
    expect(parseBlockquoteExtraTag('[abc=def]', 1, 1000)).toEqual(undefined)
  })

  it("shouldn't parse a correct tag if maxPos ends before tag end", () => {
    expect(parseBlockquoteExtraTag('[abc=def]', 0, 1)).toEqual(undefined)
  })

  it("shouldn't parse a correct tag if start index is after maxPos", () => {
    expect(parseBlockquoteExtraTag('   [abc=def]', 3, 2)).toEqual(undefined)
  })
})
