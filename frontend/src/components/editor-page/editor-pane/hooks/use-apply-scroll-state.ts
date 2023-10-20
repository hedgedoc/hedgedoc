/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Logger } from '../../../../utils/logger'
import { useCodemirrorReferenceContext } from '../../change-content-context/codemirror-reference-context'
import type { ScrollState } from '../../synced-scroll/scroll-props'
import { EditorView } from '@codemirror/view'
import equal from 'fast-deep-equal'
import { useEffect, useRef } from 'react'

const logger = new Logger('useApplyScrollState')

/**
 * Applies the given {@link ScrollState scroll state} to the given {@link EditorView code mirror editor view}.
 *
 * @param view The {@link EditorView view} that should be scrolled
 * @param scrollState The {@link ScrollState scroll state} that should be applied
 */
const applyScrollState = (view: EditorView, scrollState: ScrollState): void => {
  try {
    const line = view.state.doc.line(scrollState.firstLineInView)
    const lineBlock = view.lineBlockAt(line.from)
    const margin = Math.floor(lineBlock.height * scrollState.scrolledPercentage) / 100
    const stateEffect = EditorView.scrollIntoView(line.from, { y: 'start', yMargin: -margin })
    view.dispatch({ effects: [stateEffect] })
  } catch (error) {
    logger.error('Error while applying scroll status', error)
  }
}

/**
 * Monitors the given scroll state and scrolls the editor to the state if changed.
 *
 * @param scrollState The scroll state that should be monitored
 */
export const useApplyScrollState = (scrollState: ScrollState | null): void => {
  const lastScrollPosition = useRef<ScrollState>()
  const [codeMirrorRef] = useCodemirrorReferenceContext()

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
