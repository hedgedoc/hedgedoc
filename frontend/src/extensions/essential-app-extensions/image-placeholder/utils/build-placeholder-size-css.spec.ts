/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { calculatePlaceholderContainerSize, parseSizeNumber } from './build-placeholder-size-css'

describe('parseSizeNumber', () => {
  it('undefined', () => {
    expect(parseSizeNumber(undefined)).toBe(undefined)
  })
  it('zero as number', () => {
    expect(parseSizeNumber(0)).toBe(0)
  })
  it('positive number', () => {
    expect(parseSizeNumber(234)).toBe(234)
  })
  it('negative number', () => {
    expect(parseSizeNumber(-123)).toBe(-123)
  })
  it('zero as string', () => {
    expect(parseSizeNumber('0')).toBe(0)
  })
  it('negative number as string', () => {
    expect(parseSizeNumber('-123')).toBe(-123)
  })
  it('positive number as string', () => {
    expect(parseSizeNumber('345')).toBe(345)
  })
  it('positive number with px as string', () => {
    expect(parseSizeNumber('456px')).toBe(456)
  })
  it('negative number with px as string', () => {
    expect(parseSizeNumber('-456px')).toBe(-456)
  })
})

describe('calculatePlaceholderContainerSize', () => {
  it('width undefined | height undefined', () => {
    expect(calculatePlaceholderContainerSize(undefined, undefined)).toStrictEqual([500, 200])
  })
  it('width 200 | height undefined', () => {
    expect(calculatePlaceholderContainerSize(200, undefined)).toStrictEqual([200, 80])
  })
  it('width undefined | height 100', () => {
    expect(calculatePlaceholderContainerSize(undefined, 100)).toStrictEqual([250, 100])
  })
  it('width "0" | height 0', () => {
    expect(calculatePlaceholderContainerSize('0', 0)).toStrictEqual([0, 0])
  })
  it('width 0 | height "0"', () => {
    expect(calculatePlaceholderContainerSize(0, '0')).toStrictEqual([0, 0])
  })
  it('width -345 | height 234', () => {
    expect(calculatePlaceholderContainerSize(-345, 234)).toStrictEqual([-345, 234])
  })
  it('width 345 | height -234', () => {
    expect(calculatePlaceholderContainerSize(345, -234)).toStrictEqual([345, -234])
  })
  it('width "-345" | height -234', () => {
    expect(calculatePlaceholderContainerSize('-345', -234)).toStrictEqual([-345, -234])
  })
  it('width -345 | height "-234"', () => {
    expect(calculatePlaceholderContainerSize(-345, '-234')).toStrictEqual([-345, -234])
  })
})
