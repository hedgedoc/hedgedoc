/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { changeCursorsToWholeLineIfNoToCursor } from './change-cursors-to-whole-line-if-no-to-cursor'
import type { CursorSelection } from '../../../../editor/types'

describe('changeCursorsToWholeLineIfNoToCursor', () => {
  it(`returns the given selection if to cursor is present`, () => {
    const givenSelection = {
      from: {
        line: 0,
        character: 0
      },
      to: {
        line: 0,
        character: 0
      }
    }

    expect(changeCursorsToWholeLineIfNoToCursor([], givenSelection)).toEqual(givenSelection)
  })

  it(`returns the corrected selection if to cursor isn't present and referred line does exist`, () => {
    const givenSelection = {
      from: {
        line: 0,
        character: 123
      }
    }

    const expectedSelection: CursorSelection = {
      from: {
        line: 0,
        character: 0
      },
      to: {
        line: 0,
        character: 27
      }
    }

    expect(changeCursorsToWholeLineIfNoToCursor([`I'm a friendly test string!`], givenSelection)).toEqual(
      expectedSelection
    )
  })

  it(`fails if to cursor isn't present and referred line doesn't exist`, () => {
    const givenSelection = {
      from: {
        line: 1,
        character: 123
      }
    }

    expect(() => changeCursorsToWholeLineIfNoToCursor([''], givenSelection)).toThrow()
  })
})
