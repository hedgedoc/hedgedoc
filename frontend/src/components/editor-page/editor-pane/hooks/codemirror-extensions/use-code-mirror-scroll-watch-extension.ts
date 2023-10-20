/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ScrollState } from '../../../synced-scroll/scroll-props'
import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useCallback, useMemo } from 'react'

export type OnScrollCallback = ((scrollState: ScrollState) => void) | undefined

/**
 * Extracts the {@link ScrollState scroll state} from the given {@link EditorView editor view}.
 *
 * @param view The {@link EditorView editor view} whose scroll state should be extracted.
 */
export const extractScrollState = (view: EditorView): ScrollState => {
  const state = view.state
  const scrollTop = view.scrollDOM.scrollTop
  const lineBlockAtHeight = view.lineBlockAtHeight(scrollTop)
  const line = state.doc.lineAt(lineBlockAtHeight.from)
  const percentageRaw = (scrollTop - lineBlockAtHeight.top) / lineBlockAtHeight.height
  const scrolledPercentage = Math.floor(percentageRaw * 100)
  return {
    firstLineInView: line.number,
    scrolledPercentage
  }
}

/**
 * Creates a code mirror extension for the scroll binding.
 * It calculates a {@link ScrollState} and posts it on change.
 *
 * @param onScroll The callback that is used to post {@link ScrollState scroll states} when the editor view is scrolling.
 * @return The extensions that watches the scrolling in the editor.
 */
export const useCodeMirrorScrollWatchExtension = (onScroll: OnScrollCallback | null): Extension => {
  const onEditorScroll = useCallback(
    (view: EditorView) => {
      if (!onScroll || !view) {
        return undefined
      }
      onScroll(extractScrollState(view))
    },
    [onScroll]
  )
  return useMemo(
    () =>
      EditorView.domEventHandlers({
        scroll: (event, view) => onEditorScroll(view)
      }),
    [onEditorScroll]
  )
}
