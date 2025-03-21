/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NoSubdirectoryAllowedError, WrongProtocolError } from './errors.js'
import { parseUrl } from './parse-url.js'
import { describe, expect, it } from '@jest/globals'

describe('validate url', () => {
  it("doesn't accept non-urls", () => {
    expect(parseUrl('noUrl').isEmpty()).toBeTruthy()
  })

  describe('protocols', () => {
    it('works with http', () => {
      expect(parseUrl('http://example.org').get().toString()).toEqual(
        'http://example.org/',
      )
    })
    it('works with https', () => {
      expect(parseUrl('https://example.org').get().toString()).toEqual(
        'https://example.org/',
      )
    })
    it("doesn't work without protocol", () => {
      expect(() => parseUrl('example.org').isEmpty()).toBeTruthy()
    })
    it("doesn't work any other protocol", () => {
      expect(() => parseUrl('git://example.org').get()).toThrowError(
        WrongProtocolError,
      )
    })
  })

  describe('trailing slash', () => {
    it('accepts urls with just domain with trailing slash', () => {
      expect(parseUrl('http://example.org/').get().toString()).toEqual(
        'http://example.org/',
      )
    })
    it('accepts urls with just domain without trailing slash', () => {
      expect(parseUrl('http://example.org').get().toString()).toEqual(
        'http://example.org/',
      )
    })
    it('declines urls with with subpath and trailing slash', () => {
      expect(() =>
        parseUrl('http://example.org/asd/').get().toString(),
      ).toThrow(NoSubdirectoryAllowedError)
    })
    it('declines urls with with subpath and without trailing slash', () => {
      expect(() => parseUrl('http://example.org/asd').get().toString()).toThrow(
        NoSubdirectoryAllowedError,
      )
    })
  })
})
