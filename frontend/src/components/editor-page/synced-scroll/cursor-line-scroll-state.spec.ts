/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { buildCursorLineScrollState } from './cursor-line-scroll-state'

describe('buildCursorLineScrollState', () => {
  it('returns null without a cursor position', () => {
    expect(buildCursorLineScrollState([0, 6], undefined)).toBeNull()
  })

  it('returns null without line start indexes', () => {
    expect(buildCursorLineScrollState([], 0)).toBeNull()
  })

  it('returns the first line for a cursor at the start of the document', () => {
    expect(buildCursorLineScrollState([0, 6, 12], 0)).toEqual({ firstLineInView: 1, scrolledPercentage: 0 })
  })

  it('returns the matching line for a cursor inside the document', () => {
    expect(buildCursorLineScrollState([0, 6, 12], 8)).toEqual({ firstLineInView: 2, scrolledPercentage: 0 })
  })

  it('returns the next line for a cursor at the start of that line', () => {
    expect(buildCursorLineScrollState([0, 6, 12], 12)).toEqual({ firstLineInView: 3, scrolledPercentage: 0 })
  })
})
