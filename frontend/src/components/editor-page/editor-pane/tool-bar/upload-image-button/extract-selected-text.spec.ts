/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { extractSelectedText } from './extract-selected-text'
import type { EditorState, SelectionRange } from '@codemirror/state'
import { Mock } from 'ts-mockery'

describe('extract selected text', () => {
  const mockContent = "I'm a mock content!"

  const mockState = (selection: SelectionRange | undefined): EditorState => {
    return Mock.of<EditorState>({
      selection: {
        main: selection
      },
      sliceDoc: (from, to) => mockContent.slice(from, to)
    })
  }

  it('extracts the correct text', () => {
    const selection = Mock.of<SelectionRange>({
      from: 2,
      to: 5
    })
    const state = mockState(selection)
    expect(extractSelectedText(state)).toBe('m a')
  })

  it("doesn't extract if from and to are the same", () => {
    const selection = Mock.of<SelectionRange>({
      from: 2,
      to: 2
    })
    const state = mockState(selection)
    expect(extractSelectedText(state)).toBeUndefined()
  })

  it("doesn't extract if there is no selection", () => {
    const state = mockState(undefined)
    expect(extractSelectedText(state)).toBeUndefined()
  })
})
