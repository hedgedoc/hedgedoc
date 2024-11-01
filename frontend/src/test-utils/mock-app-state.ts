/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
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
import type { NoteDetails } from '../redux/note-details/types'
import type { RealtimeStatus } from '../redux/realtime/types'
import type { DeepPartial } from '@hedgedoc/commons'

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
      printMode: false,
      editorConfig: {
        ...initialStateEditorConfig,
        ...state?.editorConfig
      },
      history: state?.history ?? [],
      noteDetails: {
        ...initialStateNoteDetails,
        ...state?.noteDetails
      } as NoteDetails,
      realtimeStatus: {
        ...initialStateRealtimeStatus,
        ...state?.realtimeStatus
      } as RealtimeStatus,
      rendererStatus: {
        ...initialStateRendererStatus,
        ...state?.rendererStatus
      },
      user: state?.user ?? null
    })
  })
}
