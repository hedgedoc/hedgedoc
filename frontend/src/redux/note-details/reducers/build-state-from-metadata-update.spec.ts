/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { initialState } from '../initial-state'
import type { NoteDetails } from '../types'
import { buildStateFromMetadataUpdate } from './build-state-from-metadata-update'
import type { NoteMetadataDto } from '@hedgedoc/commons'

describe('build state from server permissions', () => {
  it('creates a new state with the given permissions', () => {
    const state: NoteDetails = { ...initialState }
    const metadata: NoteMetadataDto = {
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
