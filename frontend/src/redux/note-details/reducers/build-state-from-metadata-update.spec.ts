/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteMetadata } from '../../../api/notes/types'
import { initialState } from '../initial-state'
import type { NoteDetails } from '../types'
import { buildStateFromMetadataUpdate } from './build-state-from-metadata-update'

describe('build state from server permissions', () => {
  it('creates a new state with the given permissions', () => {
    const state: NoteDetails = { ...initialState }
    const metadata: NoteMetadata = {
      updateUsername: 'test',
      permissions: {
        owner: null,
        sharedToGroups: [],
        sharedToUsers: []
      },
      editedBy: [],
      primaryAddress: 'test-id',
      tags: ['test'],
      description: 'test',
      id: 'test-id',
      aliases: [],
      title: 'test',
      version: 2,
      viewCount: 42,
      createdAt: '2022-09-18T18:51:00.000+02:00',
      updatedAt: '2022-09-18T18:52:00.000+02:00'
    }
    expect(buildStateFromMetadataUpdate(state, metadata)).toStrictEqual({
      ...state,
      updateUsername: 'test',
      permissions: {
        owner: null,
        sharedToGroups: [],
        sharedToUsers: []
      },
      editedBy: [],
      primaryAddress: 'test-id',
      id: 'test-id',
      aliases: [],
      title: 'test',
      version: 2,
      viewCount: 42,
      createdAt: 1663519860,
      updatedAt: 1663519920
    })
  })
})
