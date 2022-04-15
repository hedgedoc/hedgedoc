/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as generateNoteTitleModule from '../generate-note-title'
import { buildStateFromFirstHeadingUpdate } from './build-state-from-first-heading-update'
import { initialState } from '../initial-state'

describe('build state from first heading update', () => {
  const generateNoteTitleMock = jest.spyOn(generateNoteTitleModule, 'generateNoteTitle')

  beforeAll(() => {
    generateNoteTitleMock.mockImplementation(() => 'generated title')
  })

  afterAll(() => {
    generateNoteTitleMock.mockReset()
  })

  it('generates a new state with the given first heading', () => {
    const startState = { ...initialState, firstHeading: 'heading', title: 'noteTitle' }
    const actual = buildStateFromFirstHeadingUpdate(startState, 'new first heading')
    expect(actual).toStrictEqual({ ...initialState, firstHeading: 'new first heading', title: 'generated title' })
  })
})
