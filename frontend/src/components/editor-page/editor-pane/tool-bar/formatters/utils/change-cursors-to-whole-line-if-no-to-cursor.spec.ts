/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CursorSelection } from '../types/cursor-selection'
import {
  changeCursorsToWholeLineIfNoToCursor,
  searchForEndOfLine,
  searchForStartOfLine
} from './change-cursors-to-whole-line-if-no-to-cursor'

describe('changeCursorsToWholeLineIfNoToCursor', () => {
  it(`returns the given selection if to cursor is present`, () => {
    const givenSelection = {
      from: 0,
      to: 0
    }

    expect(changeCursorsToWholeLineIfNoToCursor('', givenSelection)).toEqual(givenSelection)
  })

  it(`returns the corrected selection if cursor is in a line`, () => {
    const givenSelection = {
      from: 9
    }

    const expectedSelection: CursorSelection = {
      from: 6,
      to: 14
    }

    expect(changeCursorsToWholeLineIfNoToCursor(`I'm a\nfriendly\ntest string!`, givenSelection)).toEqual(
      expectedSelection
    )
  })

  it(`returns the corrected selection if cursor is out of bounds`, () => {
    const givenSelection = {
      from: 123
    }

    const expectedSelection: CursorSelection = {
      from: 0,
      to: 27
    }

    expect(changeCursorsToWholeLineIfNoToCursor(`I'm a friendly test string!`, givenSelection)).toEqual(
      expectedSelection
    )
  })
})

describe('searchForStartOfLine', () => {
  it('finds the start of the string', () => {
    expect(searchForStartOfLine('a', 1)).toBe(0)
  })
  it('finds the start of the string if the index is lower out of bounds', () => {
    expect(searchForStartOfLine('a', -100)).toBe(0)
  })
  it('finds the start of the string if the index is upper out of bounds', () => {
    expect(searchForStartOfLine('a', 100)).toBe(0)
  })
  it('finds the start of a line', () => {
    expect(searchForStartOfLine('a\nb', 3)).toBe(2)
  })
  it('finds the start of a line if the index is lower out of bounds', () => {
    expect(searchForStartOfLine('a\nb', -100)).toBe(0)
  })
  it('finds the start of a line if the index is upper out of bounds', () => {
    expect(searchForStartOfLine('a\nb', 100)).toBe(2)
  })
})

describe('searchForEndOfLine', () => {
  it('finds the end of the string', () => {
    expect(searchForEndOfLine('a', 1)).toBe(1)
  })
  it('finds the end of the string if the index is lower out of bounds', () => {
    expect(searchForEndOfLine('a', -100)).toBe(1)
  })
  it('finds the end of the string if the index is upper out of bounds', () => {
    expect(searchForEndOfLine('a', 100)).toBe(1)
  })
  it('finds the start of a line', () => {
    expect(searchForEndOfLine('a\nb', 2)).toBe(3)
  })
  it('finds the start of a line if the index is lower out of bounds', () => {
    expect(searchForEndOfLine('a\nb', -100)).toBe(1)
  })
  it('finds the start of a line if the index is upper out of bounds', () => {
    expect(searchForEndOfLine('a\nb', 100)).toBe(3)
  })
})
