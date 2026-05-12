/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from '@jest/globals'
import { parseTagsField } from './parse-tags-field.js'

describe('parseTagsField', () => {
  it('parses comma-separated strings', () => {
    expect(parseTagsField('foo, bar,baz')).toStrictEqual(['foo', 'bar', 'baz'])
  })

  it('removes empty string entries from comma-separated strings', () => {
    expect(parseTagsField('foo,, bar')).toStrictEqual(['foo', 'bar'])
  })

  it('parses arrays by stringifying each item', () => {
    expect(parseTagsField(['foo', 123, true])).toStrictEqual(['foo', '123', 'true'])
  })

  it('removes empty string entries from array entries', () => {
    expect(parseTagsField(['foo', '', 'bar'])).toStrictEqual(['foo', 'bar'])
  })

  it('returns an empty array for invalid input', () => {
    expect(parseTagsField(undefined)).toStrictEqual([])
  })
})
