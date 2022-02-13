/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as buildStateFromUpdatedMarkdownContentLinesModule from '../build-state-from-updated-markdown-content'
import * as replaceSelectionModule from '../format-selection/formatters/replace-selection'
import { Mock } from 'ts-mockery'
import type { NoteDetails } from '../types/note-details'
import { buildStateFromReplaceSelection } from './build-state-from-replace-selection'
import { initialState } from '../initial-state'
import type { CursorSelection } from '../../editor/types'

describe('build state from replace selection', () => {
  const buildStateFromUpdatedMarkdownContentMock = jest.spyOn(
    buildStateFromUpdatedMarkdownContentLinesModule,
    'buildStateFromUpdatedMarkdownContent'
  )
  const replaceSelectionMock = jest.spyOn(replaceSelectionModule, 'replaceSelection')
  const mockedNoteDetails = { content: 'mocked' } as unknown as NoteDetails
  const mockedFormattedContent = 'formatted'
  const mockedCursor = Mock.of<CursorSelection>()

  beforeAll(() => {
    buildStateFromUpdatedMarkdownContentMock.mockImplementation(() => mockedNoteDetails)
    replaceSelectionMock.mockImplementation(() => [mockedFormattedContent, mockedCursor])
  })

  afterAll(() => {
    buildStateFromUpdatedMarkdownContentMock.mockReset()
    replaceSelectionMock.mockReset()
  })

  it('builds a new state with the provided cursor', () => {
    const originalLines = 'original'
    const startState = {
      ...initialState,
      markdownContent: { plain: originalLines, lines: [originalLines], lineStartIndexes: [0] }
    }
    const customCursor = Mock.of<CursorSelection>()
    const textReplacement = 'replacement'

    const result = buildStateFromReplaceSelection(startState, 'replacement', customCursor)

    expect(result).toStrictEqual({ content: 'mocked', selection: mockedCursor })
    expect(buildStateFromUpdatedMarkdownContentMock).toHaveBeenCalledWith(startState, mockedFormattedContent)
    expect(replaceSelectionMock).toHaveBeenCalledWith(originalLines, customCursor, textReplacement)
  })

  it('builds a new state with the state cursor', () => {
    const originalLines = 'original'
    const selection = Mock.of<CursorSelection>()
    const startState: NoteDetails = {
      ...initialState,
      markdownContent: { plain: originalLines, lines: [originalLines], lineStartIndexes: [0] },
      selection
    }
    const textReplacement = 'replacement'

    const result = buildStateFromReplaceSelection(startState, 'replacement')

    expect(result).toStrictEqual({ content: 'mocked', selection: mockedCursor })
    expect(buildStateFromUpdatedMarkdownContentMock).toHaveBeenCalledWith(startState, mockedFormattedContent)
    expect(replaceSelectionMock).toHaveBeenCalledWith(originalLines, selection, textReplacement)
  })
})
