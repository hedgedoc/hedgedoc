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
  const buildStateFromUpdatedMarkdownContentLinesMock = jest.spyOn(
    buildStateFromUpdatedMarkdownContentLinesModule,
    'buildStateFromUpdatedMarkdownContentLines'
  )
  const replaceSelectionMock = jest.spyOn(replaceSelectionModule, 'replaceSelection')
  const mockedNoteDetails = Mock.of<NoteDetails>()
  const mockedReplacedLines = ['replaced']

  beforeAll(() => {
    buildStateFromUpdatedMarkdownContentLinesMock.mockImplementation(() => mockedNoteDetails)
    replaceSelectionMock.mockImplementation(() => mockedReplacedLines)
  })

  afterAll(() => {
    buildStateFromUpdatedMarkdownContentLinesMock.mockReset()
    replaceSelectionMock.mockReset()
  })

  it('builds a new state with the provided cursor', () => {
    const originalLines = ['original']
    const startState = { ...initialState, markdownContentLines: originalLines }
    const customCursor = Mock.of<CursorSelection>()
    const textReplacement = 'replacement'

    const result = buildStateFromReplaceSelection(startState, 'replacement', customCursor)

    expect(result).toBe(mockedNoteDetails)
    expect(buildStateFromUpdatedMarkdownContentLinesMock).toHaveBeenCalledWith(startState, mockedReplacedLines)
    expect(replaceSelectionMock).toHaveBeenCalledWith(originalLines, customCursor, textReplacement)
  })

  it('builds a new state with the state cursor', () => {
    const originalLines = ['original']
    const selection = Mock.of<CursorSelection>()
    const startState = { ...initialState, markdownContentLines: originalLines, selection }
    const textReplacement = 'replacement'

    const result = buildStateFromReplaceSelection(startState, 'replacement')

    expect(result).toBe(mockedNoteDetails)
    expect(buildStateFromUpdatedMarkdownContentLinesMock).toHaveBeenCalledWith(startState, mockedReplacedLines)
    expect(replaceSelectionMock).toHaveBeenCalledWith(originalLines, selection, textReplacement)
  })
})
