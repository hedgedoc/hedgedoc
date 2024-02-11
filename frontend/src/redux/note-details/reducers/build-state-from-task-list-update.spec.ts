/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as buildStateFromUpdatedMarkdownContentLinesModule from '../build-state-from-updated-markdown-content'
import { initialState } from '../initial-state'
import type { NoteDetails } from '../types'
import { buildStateFromTaskListUpdate } from './build-state-from-task-list-update'
import { Mock } from 'ts-mockery'

jest.mock('../build-state-from-updated-markdown-content')

describe('build state from task list update', () => {
  const buildStateFromUpdatedMarkdownContentLinesMock = jest.spyOn(
    buildStateFromUpdatedMarkdownContentLinesModule,
    'buildStateFromUpdatedMarkdownContentLines'
  )
  const mockedNoteDetails = Mock.of<NoteDetails>()

  beforeAll(() => {
    buildStateFromUpdatedMarkdownContentLinesMock.mockImplementation(() => mockedNoteDetails)
  })

  afterAll(() => {
    buildStateFromUpdatedMarkdownContentLinesMock.mockReset()
  })

  const markdownContentLines = ['no task', '- [ ] not checked', '- [x] checked']

  it(`doesn't change the state if the line doesn't contain a task`, () => {
    const startState: NoteDetails = {
      ...initialState,
      markdownContent: { ...initialState.markdownContent, lines: markdownContentLines }
    }
    const result = buildStateFromTaskListUpdate(startState, 0, true)
    expect(result).toBe(startState)
    expect(buildStateFromUpdatedMarkdownContentLinesMock).toBeCalledTimes(0)
  })

  it(`can change the state of a task to checked`, () => {
    const startState: NoteDetails = {
      ...initialState,
      markdownContent: { ...initialState.markdownContent, lines: markdownContentLines }
    }
    const result = buildStateFromTaskListUpdate(startState, 1, true)
    expect(result).toBe(mockedNoteDetails)
    expect(buildStateFromUpdatedMarkdownContentLinesMock).toBeCalledWith(startState, [
      'no task',
      '- [x] not checked',
      '- [x] checked'
    ])
  })

  it(`can change the state of a task to unchecked`, () => {
    const startState: NoteDetails = {
      ...initialState,
      markdownContent: { ...initialState.markdownContent, lines: markdownContentLines }
    }
    const result = buildStateFromTaskListUpdate(startState, 2, false)
    expect(result).toBe(mockedNoteDetails)
    expect(buildStateFromUpdatedMarkdownContentLinesMock).toBeCalledWith(startState, [
      'no task',
      '- [ ] not checked',
      '- [ ] checked'
    ])
  })
})
