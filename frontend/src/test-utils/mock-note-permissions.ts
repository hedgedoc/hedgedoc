/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ApplicationState } from '../redux'
import { mockAppState } from './mock-app-state'
import type { DeepPartial, NotePermissions } from '@hedgedoc/commons'

/**
 * Mocks the {@link NotePermissions} field of a note in the {@link ApplicationState }for a test.
 * This test-util should not be used alongside {@link mockAppState} to avoid overwriting the mocked state.
 *
 * @param ownUsername The name of the own user to set in the state (for comparing note ownership)
 * @param noteOwner The owner's username of the mocked note
 * @param permissions Overrides for the mocked permissions
 * @param additionalState Overrides for the overall mocked application state
 */
export const mockNotePermissions = (
  ownUsername: string,
  noteOwner: string,
  permissions?: DeepPartial<NotePermissions>,
  additionalState?: DeepPartial<ApplicationState>
) => {
  mockAppState({
    ...additionalState,
    noteDetails: {
      ...additionalState?.noteDetails,
      permissions: {
        sharedToGroups: [],
        sharedToUsers: [],
        ...permissions,
        owner: noteOwner
      }
    },
    user: {
      ...additionalState?.user,
      username: ownUsername
    }
  } as DeepPartial<ApplicationState>)
}
