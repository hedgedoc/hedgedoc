/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { MutableRefObject } from 'react'
import { useEffect, useRef } from 'react'
import type { ScrollState } from '../../synced-scroll/scroll-props'
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { EditorView } from '@codemirror/view'
import equal from 'fast-deep-equal'

/**
 * Applies the given {@link ScrollState scroll state} to the given {@link EditorView code mirror editor view}.
 *
 * @param view The {@link EditorView view} that should be scrolled
 * @param scrollState The {@link ScrollState scroll state} that should be applied
 */
export const applyScrollState = (view: EditorView, scrollState: ScrollState): void => {
  const line = view.state.doc.line(scrollState.firstLineInView)
  const lineBlock = view.lineBlockAt(line.from)
  const margin = Math.floor(lineBlock.height * scrollState.scrolledPercentage) / 100
  const stateEffect = EditorView.scrollIntoView(line.from, { y: 'start', yMargin: -margin })
  view.dispatch({ effects: [stateEffect] })
}

/**
 * Monitors the given scroll state and scrolls the editor to the state if changed.
 *
 * @param editorRef The editor that should be manipulated
 * @param scrollState The scroll state that should be monitored
 */
export const useApplyScrollState = (
  editorRef: MutableRefObject<ReactCodeMirrorRef | null>,
  scrollState?: ScrollState
): void => {
  const lastScrollPosition = useRef<ScrollState>()

  useEffect(() => {
    const view = editorRef.current?.view
    if (!view || !scrollState) {
      return
    }

    if (equal(scrollState, lastScrollPosition.current)) {
      return
    }
    applyScrollState(view, scrollState)
    lastScrollPosition.current = scrollState
  }, [editorRef, scrollState])
}
