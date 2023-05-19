/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { concatCssClasses } from './concat-css-classes'

describe('concat css classes', () => {
  it('works with a map', () => {
    expect(concatCssClasses({ a: true, b: false, c: true })).toBe('a c')
  })

  it('works with a string array ', () => {
    expect(concatCssClasses('a', 'b', 'c')).toBe('a b c')
  })

  it('works with a string array and map', () => {
    expect(concatCssClasses('a', 'b', 'c', { d: true, e: false, f: true })).toBe('a b c d f')
  })

  it("doesn't include undefined and null", () => {
    expect(concatCssClasses(undefined, null)).toBe('')
  })

  it("doesn't include duplicates", () => {
    expect(concatCssClasses('a', 'a', { a: true })).toBe('a')
  })

  it("doesn't include empty class names", () => {
    expect(concatCssClasses('a', '', { '': true })).toBe('a')
  })
})
