/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { HistoryEntryWithOrigin } from '../api/history/types'
import type { DarkModeConfig } from './dark-mode/types'
import type { EditorConfig } from './editor/types'
import type { RealtimeStatus } from './realtime/types'
import type { RendererStatus } from './renderer-status/types'
import type { OptionalUserState } from './user/types'
import type { OptionalNoteDetails } from './note-details/types/note-details'

export interface ApplicationState {
  user: OptionalUserState
  history: HistoryEntryWithOrigin[]
  editorConfig: EditorConfig
  darkMode: DarkModeConfig
  noteDetails: OptionalNoteDetails
  rendererStatus: RendererStatus
  realtimeStatus: RealtimeStatus
}
