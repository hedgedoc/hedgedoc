/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as buildStateFromUpdatedMarkdownContentLinesModule from '../build-state-from-updated-markdown-content'
import { Mock } from 'ts-mockery'
import type { NoteDetails } from '../types/note-details'
import * as applyFormatTypeToMarkdownLinesModule from '../format-selection/apply-format-type-to-markdown-lines'
import { buildStateFromSelectionFormat } from './build-state-from-selection-format'
import { initialState } from '../initial-state'
import { FormatType } from '../types'
import type { CursorSelection } from '../../editor/types'

describe('build state from selection format', () => {
  const buildStateFromUpdatedMarkdownContentLinesMock = jest.spyOn(
    buildStateFromUpdatedMarkdownContentLinesModule,
    'buildStateFromUpdatedMarkdownContentLines'
  )
  const mockedNoteDetails = Mock.of<NoteDetails>()
  const applyFormatTypeToMarkdownLinesMock = jest.spyOn(
    applyFormatTypeToMarkdownLinesModule,
    'applyFormatTypeToMarkdownLines'
  )
  const mockedFormattedLines = ['formatted']

  beforeAll(() => {
    buildStateFromUpdatedMarkdownContentLinesMock.mockImplementation(() => mockedNoteDetails)
    applyFormatTypeToMarkdownLinesMock.mockImplementation(() => mockedFormattedLines)
  })

  afterAll(() => {
    buildStateFromUpdatedMarkdownContentLinesMock.mockReset()
    applyFormatTypeToMarkdownLinesMock.mockReset()
  })

  it('builds a new state with the formatted code', () => {
    const originalLines = ['original']
    const customCursor = Mock.of<CursorSelection>()
    const startState = { ...initialState, markdownContentLines: originalLines, selection: customCursor }
    const result = buildStateFromSelectionFormat(startState, FormatType.BOLD)
    expect(result).toBe(mockedNoteDetails)
    expect(buildStateFromUpdatedMarkdownContentLinesMock).toHaveBeenCalledWith(startState, mockedFormattedLines)
    expect(applyFormatTypeToMarkdownLinesMock).toHaveBeenCalledWith(originalLines, customCursor, FormatType.BOLD)
  })
})
