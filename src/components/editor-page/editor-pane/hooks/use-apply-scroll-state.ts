/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useRef } from 'react'
import type { ScrollState } from '../../synced-scroll/scroll-props'
import { EditorView } from '@codemirror/view'
import equal from 'fast-deep-equal'
import { useCodeMirrorReference } from '../../change-content-context/change-content-context'

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
export const useApplyScrollState = (scrollState?: ScrollState): void => {
  const lastScrollPosition = useRef<ScrollState>()
  const codeMirrorRef = useCodeMirrorReference()

  useEffect(() => {
    const view = codeMirrorRef
    if (!view || !scrollState) {
      return
    }

    if (equal(scrollState, lastScrollPosition.current)) {
      return
    }
    applyScrollState(view, scrollState)
    lastScrollPosition.current = scrollState
  }, [codeMirrorRef, scrollState])
}
