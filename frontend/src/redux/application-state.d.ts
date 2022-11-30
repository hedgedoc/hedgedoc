/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Config } from '../api/config/types'
import type { HistoryEntryWithOrigin } from '../api/history/types'
import type { DarkModeConfig } from './dark-mode/types'
import type { EditorConfig } from './editor/types'
import type { NoteDetails } from './note-details/types/note-details'
import type { RealtimeState } from './realtime/types'
import type { RendererStatus } from './renderer-status/types'
import type { OptionalUserState } from './user/types'

export interface ApplicationState {
  user: OptionalUserState
  config: Config
  history: HistoryEntryWithOrigin[]
  editorConfig: EditorConfig
  darkMode: DarkModeConfig
  noteDetails: NoteDetails
  rendererStatus: RendererStatus
  realtime: RealtimeState
}
