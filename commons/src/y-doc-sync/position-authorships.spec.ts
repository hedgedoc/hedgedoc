/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from '@jest/globals'
import type { ShortRealtimeUser } from '../message-transporters'
import type { AbsolutePositionAuthorship } from './position-authorship'
import { convertAbsolutePositionAuthorshipsToRanges } from './position-authorship'

describe('convertAbsolutePositionAuthorshipsToRanges', () => {
  const userA: ShortRealtimeUser = {
    displayName: 'user A',
    username: 'user_a',
    styleIndex: 0,
    guestUuid: null,
  }
  const userB: ShortRealtimeUser = {
    displayName: 'user B',
    username: 'user_b',
    styleIndex: 1,
    guestUuid: null,
  }
  it('correctly handles an empty array', () => {
    const result = convertAbsolutePositionAuthorshipsToRanges([], 0)
    expect(result).toEqual([])
  })
  it('correctly handles many single character positions', () => {
    const positionAuthorships: AbsolutePositionAuthorship[] = [
      [0, userA],
      [1, userB],
      [2, userA],
      [3, userB],
    ]
    const result = convertAbsolutePositionAuthorshipsToRanges(positionAuthorships, 4)
    expect(result).toHaveLength(4)
    expect(result[0]).toEqual({
      from: 0,
      to: 1,
      user: userA,
    })
    expect(result[1]).toEqual({
      from: 1,
      to: 2,
      user: userB,
    })
    expect(result[2]).toEqual({
      from: 2,
      to: 3,
      user: userA,
    })
    expect(result[3]).toEqual({
      from: 3,
      to: 4,
      user: userB,
    })
  })
  it('correctly handles some longer positions', () => {
    const positionAuthorships: AbsolutePositionAuthorship[] = [
      [0, userA],
      [5, userB],
    ]
    const result = convertAbsolutePositionAuthorshipsToRanges(positionAuthorships, 10)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      from: 0,
      to: 5,
      user: userA,
    })
    expect(result[1]).toEqual({
      from: 5,
      to: 10,
      user: userB,
    })
  })
})
