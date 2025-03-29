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

jest.mock('../redux/editor-config/methods', () => ({
  loadFromLocalStorage: jest.fn().mockReturnValue(undefined)
}))
jest.mock('../hooks/common/use-application-state')

/**
 * Mocks the {@link ApplicationState} for a test.
 * When not overriden, it uses the initial state of the reducers.
 *
 * @param state Overrides for the mocked state
 */
export const mockAppState = (state?: DeepPartial<ApplicationState>) => {
  jest.spyOn(useApplicationStateModule, 'useApplicationState').mockImplementation((fn) => {
    return fn({
      darkMode: {
        ...initialStateDarkMode,
        ...state?.darkMode
      },
      editorConfig: {
        ...initialStateEditorConfig,
        ...state?.editorConfig
      },
      history: [], // Yes this allows no mocking and is therefore technically not correct, but the type is difficult to fix and we will remove it soon anyway.
      noteDetails: {
        ...initialStateNoteDetails,
        ...state?.noteDetails
      },
      printMode: false,
      realtimeStatus: {
        ...initialStateRealtimeStatus,
        ...state?.realtimeStatus
      },
      rendererStatus: {
        ...initialStateRendererStatus,
        ...state?.rendererStatus
      },
      user: state?.user
        ? {
            username: state.user.username ?? '',
            email: state.user.email ?? null,
            displayName: state.user.displayName ?? '',
            photoUrl: state.user.photoUrl ?? null,
            authProvider: state.user.authProvider ?? ProviderType.LOCAL
          }
        : null
    })
  })
}
