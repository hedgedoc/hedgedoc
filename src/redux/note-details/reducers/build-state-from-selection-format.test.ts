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
  const buildStateFromUpdatedMarkdownContentMock = jest.spyOn(
    buildStateFromUpdatedMarkdownContentLinesModule,
    'buildStateFromUpdatedMarkdownContent'
  )
  const mockedNoteDetails = { content: 'mocked' } as unknown as NoteDetails
  const applyFormatTypeToMarkdownLinesMock = jest.spyOn(
    applyFormatTypeToMarkdownLinesModule,
    'applyFormatTypeToMarkdownLines'
  )
  const mockedFormattedContent = 'formatted'
  const mockedCursor = Mock.of<CursorSelection>()

  beforeAll(() => {
    buildStateFromUpdatedMarkdownContentMock.mockImplementation(() => mockedNoteDetails)
    applyFormatTypeToMarkdownLinesMock.mockImplementation(() => [mockedFormattedContent, mockedCursor])
  })

  afterAll(() => {
    buildStateFromUpdatedMarkdownContentMock.mockReset()
    applyFormatTypeToMarkdownLinesMock.mockReset()
  })

  it('builds a new state with the formatted code', () => {
    const originalContent = 'original'
    const startState: NoteDetails = {
      ...initialState,
      markdownContent: { ...initialState.markdownContent, plain: originalContent },
      selection: mockedCursor
    }
    const result = buildStateFromSelectionFormat(startState, FormatType.BOLD)
    expect(result).toStrictEqual({ content: 'mocked', selection: mockedCursor })
    expect(buildStateFromUpdatedMarkdownContentMock).toHaveBeenCalledWith(startState, mockedFormattedContent)
    expect(applyFormatTypeToMarkdownLinesMock).toHaveBeenCalledWith(originalContent, mockedCursor, FormatType.BOLD)
  })
})
