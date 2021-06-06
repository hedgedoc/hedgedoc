/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { parseQuoteExtraTag, QuoteExtraTagValues } from './quote-extra'

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
    expect(parseQuoteExtraTag('[abc=def]', 0, 1000)).toEqual(expected)
  })

  it("shouldn't parse a tag with no opener bracket", () => {
    expect(parseQuoteExtraTag('abc=def]', 0, 1000)).toEqual(undefined)
  })

  it("shouldn't parse a tag with no closing bracket", () => {
    expect(parseQuoteExtraTag('[abc=def', 0, 1000)).toEqual(undefined)
  })

  it("shouldn't parse a tag with no separation character", () => {
    expect(parseQuoteExtraTag('[abcdef]', 0, 1000)).toEqual(undefined)
  })

  it("shouldn't parse a tag with an empty label", () => {
    expect(parseQuoteExtraTag('[=def]', 0, 1000)).toEqual(undefined)
  })

  it("shouldn't parse a tag with an empty value", () => {
    expect(parseQuoteExtraTag('[abc=]', 0, 1000)).toEqual(undefined)
  })

  it("shouldn't parse a tag with an empty body", () => {
    expect(parseQuoteExtraTag('[]', 0, 1000)).toEqual(undefined)
  })

  it("shouldn't parse a tag with an empty body", () => {
    expect(parseQuoteExtraTag('[]', 0, 1000)).toEqual(undefined)
  })

  it("shouldn't parse a correct tag if start index isn't at the opening bracket", () => {
    expect(parseQuoteExtraTag('[abc=def]', 1, 1000)).toEqual(undefined)
  })

  it("shouldn't parse a correct tag if maxPos ends before tag end", () => {
    expect(parseQuoteExtraTag('[abc=def]', 0, 1)).toEqual(undefined)
  })

  it("shouldn't parse a correct tag if start index is after maxPos", () => {
    expect(parseQuoteExtraTag('   [abc=def]', 3, 2)).toEqual(undefined)
  })
})
