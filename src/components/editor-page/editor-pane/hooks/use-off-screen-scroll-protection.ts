/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo, useRef } from 'react'
import type { ScrollState } from '../../synced-scroll/scroll-props'
import { extractScrollState } from './code-mirror-extensions/use-code-mirror-scroll-watch-extension'
import { applyScrollState } from './use-apply-scroll-state'
import { store } from '../../../../redux'
import type { Extension } from '@codemirror/state'
import { Logger } from '../../../../utils/logger'
import { EditorView } from '@codemirror/view'

const logger = new Logger('useOffScreenScrollProtection')

/**
 * If the editor content changes while the editor isn't focused then the editor starts jumping around.
 * This extension fixes this behaviour by saving the scroll state when the editor looses focus and applies it on content changes.
 *
 * @returns necessary {@link Extension code mirror extensions} to provide the functionality
 */
export const useOffScreenScrollProtection = (): Extension[] => {
  const offFocusScrollState = useRef<ScrollState>()

  return useMemo(() => {
    const saveOffFocusScrollStateExtension = EditorView.domEventHandlers({
      blur: (event, view) => {
        offFocusScrollState.current = extractScrollState(view)
        logger.debug('Save off-focus scroll state', offFocusScrollState.current)
      },
      focus: () => {
        offFocusScrollState.current = undefined
      }
    })

    const changeExtension = EditorView.updateListener.of((update) => {
      const view = update.view
      const scrollState = offFocusScrollState.current
      if (!scrollState || !update.docChanged) {
        return
      }
      logger.debug('Apply off-focus scroll state', scrollState)
      applyScrollState(view, scrollState)
      const selection = store.getState().noteDetails.selection
      view.dispatch(
        view.state.update({
          selection: {
            anchor: selection.from,
            head: selection.to
          }
        })
      )
    })

    return [saveOffFocusScrollStateExtension, changeExtension]
  }, [])
}
