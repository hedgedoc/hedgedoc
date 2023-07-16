/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'
import { EditorView } from '@codemirror/view'
import { setNoteContent } from '../../../../redux/note-details/methods'

/**
 * Syncs the CodeMirror content to the redux store.
 *
 * @return the codemirror extension that updates the redux state
 */
export const useSyncToReduxExtension = () => {
  return useMemo(
    () =>
      EditorView.updateListener.of((update) => {
        if (!update.docChanged) {
          return
        }
        setNoteContent(update.state.sliceDoc())
      }),
    []
  )
}
