/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { updateCursorPositions } from '../../../../redux/note-details/methods'
import type { Extension, SelectionRange } from '@codemirror/state'
import type { ViewUpdate } from '@codemirror/view'
import { EditorView } from '@codemirror/view'
import { useMemo, useRef } from 'react'

/**
 * Provides a callback for codemirror that handles cursor changes.
 *
 * @return the generated callback
 */
export const useCursorActivityCallback = (): Extension => {
  const lastMainSelection = useRef<SelectionRange>()

  return useMemo(
    () =>
      EditorView.updateListener.of((viewUpdate: ViewUpdate): void => {
        const firstSelection = viewUpdate.state.selection.main
        if (lastMainSelection.current === firstSelection) {
          return
        }
        lastMainSelection.current = firstSelection
        updateCursorPositions({
          from: firstSelection.from,
          to: firstSelection.to === firstSelection.from ? undefined : firstSelection.to
        })
      }),
    []
  )
}
