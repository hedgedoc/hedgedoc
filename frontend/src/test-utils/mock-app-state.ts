/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as useApplicationStateModule from '../hooks/common/use-application-state'
import type { ApplicationState } from '../redux'
import { initialState as initialStateDarkMode } from '../redux/dark-mode/initial-state'
import { initialState as initialStateEditorConfig } from '../redux/editor-config/initial-state'
import { initialState as initialStateNoteDetails } from '../redux/note-details/initial-state'
import { initialState as initialStateRealtimeStatus } from '../redux/realtime/initial-state'
import { initialState as initialStateRendererStatus } from '../redux/renderer-status/initial-state'
import { type DeepPartial, ProviderType } from '@hedgedoc/commons'
import { vi } from 'vitest'
import { initialState } from '../redux/user/initial-state'

let state: ApplicationState = {
  darkMode: initialStateDarkMode,
  editorConfig: initialStateEditorConfig,
  history: [], // Yes this allows no mocking and is therefore technically not correct, but the type is difficult to fix and we will remove it soon anyway.
  noteDetails: initialStateNoteDetails,
  printMode: false,
  realtimeStatus: initialStateRealtimeStatus,
  rendererStatus: initialStateRendererStatus,
  user: initialState
}

vi.mock('../redux/editor-config/methods', async (importOriginal) => ({
  ...(await importOriginal()),
  loadFromLocalStorage: vi.fn().mockReturnValue(undefined)
}))
vi.mock('../hooks/common/use-application-state', () => {
  return {
    useApplicationState: vi.fn(<TSelected>(selector: (state: ApplicationState) => TSelected) => {
      if (state === undefined) {
        throw new Error('application state not mocked')
      }
      return selector(state)
    })
  }
})

/**
 * Mocks the {@link ApplicationState} for a test.
 * When not overriden, it uses the initial state of the reducers.
 *
 * @param newState Overrides for the mocked state
 */
export const mockAppState = (newState?: DeepPartial<ApplicationState>) => {
  state = {
    darkMode: {
      ...initialStateDarkMode,
      ...newState?.darkMode
    },
    editorConfig: {
      ...initialStateEditorConfig,
      ...newState?.editorConfig
    },
    history: [], // Yes this allows no mocking and is therefore technically not correct, but the type is difficult to fix and we will remove it soon anyway.
    noteDetails: {
      ...initialStateNoteDetails,
      ...newState?.noteDetails
    },
    printMode: false,
    realtimeStatus: {
      ...initialStateRealtimeStatus,
      ...newState?.realtimeStatus
    },
    rendererStatus: {
      ...initialStateRendererStatus,
      ...newState?.rendererStatus
    },
    user: newState?.user
      ? {
          username: newState.user.username ?? '',
          email: newState.user.email ?? null,
          displayName: newState.user.displayName ?? '',
          photoUrl: newState.user.photoUrl ?? null,
          authProvider: newState.user.authProvider ?? ProviderType.LOCAL
        }
      : null
  }
}
