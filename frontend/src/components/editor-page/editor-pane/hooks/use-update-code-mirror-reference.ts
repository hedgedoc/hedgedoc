/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCodemirrorReferenceContext } from '../../change-content-context/codemirror-reference-context'
import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useMemo } from 'react'

export const useUpdateCodeMirrorReference = (): Extension => {
  const [codeMirrorReference, setCodeMirrorReference] = useCodemirrorReferenceContext()

  return useMemo(() => {
    return EditorView.updateListener.of((update) => {
      if (codeMirrorReference !== update.view) {
        setCodeMirrorReference(update.view)
      }
    })
  }, [codeMirrorReference, setCodeMirrorReference])
}
