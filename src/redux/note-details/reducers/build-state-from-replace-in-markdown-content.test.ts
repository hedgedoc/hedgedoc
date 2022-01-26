/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as buildStateFromUpdatedMarkdownContentModule from '../build-state-from-updated-markdown-content'
import { Mock } from 'ts-mockery'
import type { NoteDetails } from '../types/note-details'
import { buildStateFromReplaceInMarkdownContent } from './build-state-from-replace-in-markdown-content'
import { initialState } from '../initial-state'

describe('build state from replace in markdown content', () => {
  const buildStateFromUpdatedMarkdownContentMock = jest.spyOn(
    buildStateFromUpdatedMarkdownContentModule,
    'buildStateFromUpdatedMarkdownContent'
  )
  const mockedNoteDetails = Mock.of<NoteDetails>()

  beforeAll(() => {
    buildStateFromUpdatedMarkdownContentMock.mockImplementation(() => mockedNoteDetails)
  })

  afterAll(() => {
    buildStateFromUpdatedMarkdownContentMock.mockReset()
  })

  it('updates the markdown content with the replacement', () => {
    const startState = { ...initialState, markdownContent: 'replaceable' }
    const result = buildStateFromReplaceInMarkdownContent(startState, 'replaceable', 'replacement')
    expect(result).toBe(mockedNoteDetails)
    expect(buildStateFromUpdatedMarkdownContentMock).toHaveBeenCalledWith(startState, 'replacement')
  })
})
