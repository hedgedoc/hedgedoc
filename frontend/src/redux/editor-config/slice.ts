/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initial-state'
import type { EditorConfig } from './types'

const editorConfigSlice = createSlice({
  name: 'editorConfig',
  initialState,
  reducers: {
    setSplitPosition: (state, action: PayloadAction<EditorConfig['splitPosition']>) => {
      state.splitPosition = action.payload
    },
    setSyncScroll: (state, action: PayloadAction<EditorConfig['syncScroll']>) => {
      state.syncScroll = action.payload
    },
    setLigatures: (state, action: PayloadAction<EditorConfig['ligatures']>) => {
      state.ligatures = action.payload
    },
    setSmartPaste: (state, action: PayloadAction<EditorConfig['smartPaste']>) => {
      state.smartPaste = action.payload
    },
    setSpellCheck: (state, action: PayloadAction<EditorConfig['spellCheck']>) => {
      state.spellCheck = action.payload
    },
    setLineWrapping: (state, action: PayloadAction<EditorConfig['lineWrapping']>) => {
      state.lineWrapping = action.payload
    },
    setIndentWithTabs: (state, action: PayloadAction<EditorConfig['indentWithTabs']>) => {
      state.indentWithTabs = action.payload
    },
    setIndentSpaces: (state, action: PayloadAction<EditorConfig['indentSpaces']>) => {
      state.indentSpaces = action.payload
    },
    setEditorConfig: (state, action: PayloadAction<EditorConfig>) => {
      return action.payload
    }
  }
})

export const editorConfigActionsCreator = editorConfigSlice.actions
export const editorConfigReducer = editorConfigSlice.reducer
