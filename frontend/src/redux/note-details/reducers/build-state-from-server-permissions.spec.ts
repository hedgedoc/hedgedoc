/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { initialState } from '../initial-state'
import type { NoteDetails } from '../types'
import { buildStateFromServerPermissions } from './build-state-from-server-permissions'
import type { NotePermissionsDto } from '@hedgedoc/commons'

describe('build state from server permissions', () => {
  it('creates a new state with the given permissions', () => {
    const state: NoteDetails = { ...initialState }
    const permissions: NotePermissionsDto = {
      owner: 'test-owner',
      sharedToUsers: [
        {
          username: 'test-user',
          canEdit: true
        }
      ],
      sharedToGroups: [
        {
          groupName: 'test-group',
          canEdit: false
        }
      ]
    }
    expect(buildStateFromServerPermissions(state, permissions)).toStrictEqual({ ...state, permissions: permissions })
  })
})
