/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RefObject } from 'react'
import { useMemo } from 'react'
import { updateCursorPositions } from '../../../../redux/note-details/methods'
import type { ViewUpdate } from '@codemirror/view'
import { EditorView } from '@codemirror/view'
import { Logger } from '../../../../utils/logger'
import type { Extension } from '@codemirror/state'

const logger = new Logger('useCursorActivityCallback')

/**
 * Provides a callback for codemirror that handles cursor changes
 *
 * @return the generated callback
 */
export const useCursorActivityCallback = (editorFocused: RefObject<boolean>): Extension => {
  return useMemo(
    () =>
      EditorView.updateListener.of((viewUpdate: ViewUpdate): void => {
        if (!editorFocused.current) {
          logger.debug("Don't post updated cursor because editor isn't focused")
          return
        }
        const firstSelection = viewUpdate.state.selection.main
        const newCursorPos = {
          from: firstSelection.from,
          to: firstSelection.to === firstSelection.from ? undefined : firstSelection.to
        }
        updateCursorPositions(newCursorPos)
      }),
    [editorFocused]
  )
}
