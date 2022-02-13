/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RefObject } from 'react'
import { useMemo, useRef } from 'react'
import { EditorView } from '@codemirror/view'
import type { Extension } from '@codemirror/state'

/**
 * Creates a {@link RefObject<boolean> reference} that contains the information if the editor is currently focused or not.
 *
 * @returns The reference and the necessary {@link Extension code mirror extension} that receives the focus and blur events
 */
export const useCodeMirrorFocusReference = (): [Extension, RefObject<boolean>] => {
  const focusReference = useRef<boolean>(false)
  const codeMirrorExtension = useMemo(
    () =>
      EditorView.domEventHandlers({
        blur: () => {
          focusReference.current = false
        },
        focus: () => {
          focusReference.current = true
        }
      }),
    []
  )

  return [codeMirrorExtension, focusReference]
}
