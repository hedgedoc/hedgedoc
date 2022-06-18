/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useMemo, useState } from 'react'
import { isMockMode } from '../../../../../utils/test-modes'
import { getGlobalState } from '../../../../../redux'
import type { YText } from 'yjs/dist/src/types/YText'
import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

/**
 * When in mock mode this hook inserts the current markdown content into the given yText to write it into the editor.
 * This happens only one time because after that the editor writes it changes into the yText which writes it into the redux.
 *
 * Usually the CodeMirror gets its content from yjs sync via websocket. But in mock mode this connection isn't available.
 * That's why this hook inserts the current markdown content, that is currently saved in the global application state
 * and was saved there by the {@link NoteLoadingBoundary note loading boundary}, into the y-text to write it into the codemirror.
 * This has to be done AFTER the CodeMirror sync extension (yCollab) has been loaded because the extension reacts only to updates of the yText
 * and doesn't write the existing content into the editor when being loaded.
 *
 * @param yText The yText in which the content should be inserted
 */
export const useInsertInitialNoteContentIntoEditorInMockMode = (yText: YText): Extension | undefined => {
  const [firstUpdateHappened, setFirstUpdateHappened] = useState<boolean>(false)

  useEffect(() => {
    if (firstUpdateHappened) {
      yText.insert(0, getGlobalState().noteDetails.markdownContent.plain)
    }
  }, [firstUpdateHappened, yText])

  return useMemo(() => {
    return isMockMode && !firstUpdateHappened
      ? EditorView.updateListener.of(() => setFirstUpdateHappened(true))
      : undefined
  }, [firstUpdateHappened])
}
