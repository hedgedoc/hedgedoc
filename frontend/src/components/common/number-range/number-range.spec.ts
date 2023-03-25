/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createNumberRangeArray } from './number-range'

describe('number range', () => {
  it('creates an empty number range', () => {
    expect(createNumberRangeArray(0)).toEqual([])
  })

  it('creates a non-empty number range', () => {
    expect(createNumberRangeArray(10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('fails with a negative range', () => {
    expect(() => createNumberRangeArray(-1)).toThrow()
  })
})
