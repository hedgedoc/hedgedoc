/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '..'
import type {
  LoadFromLocalStorageAction,
  SetEditorLigaturesAction,
  SetEditorLineWrappingAction,
  SetEditorSmartPasteAction,
  SetEditorSyncScrollAction
} from './types'
import { EditorConfigActionType } from './types'

export const setEditorSyncScroll = (syncScroll: boolean): void => {
  const action: SetEditorSyncScrollAction = {
    type: EditorConfigActionType.SET_SYNC_SCROLL,
    syncScroll
  }
  store.dispatch(action)
}

export const setEditorLineWrapping = (lineWrapping: boolean): void => {
  const action: SetEditorLineWrappingAction = {
    type: EditorConfigActionType.SET_LINE_WRAPPING,
    lineWrapping
  }
  store.dispatch(action)
}

export const setEditorLigatures = (ligatures: boolean): void => {
  const action: SetEditorLigaturesAction = {
    type: EditorConfigActionType.SET_LIGATURES,
    ligatures
  }
  store.dispatch(action)
}

export const setEditorSmartPaste = (smartPaste: boolean): void => {
  const action: SetEditorSmartPasteAction = {
    type: EditorConfigActionType.SET_SMART_PASTE,
    smartPaste
  }
  store.dispatch(action)
}

export const loadFromLocalStorage = (): void => {
  const action: LoadFromLocalStorageAction = {
    type: EditorConfigActionType.LOAD_FROM_LOCAL_STORAGE
  }
  store.dispatch(action)
}
