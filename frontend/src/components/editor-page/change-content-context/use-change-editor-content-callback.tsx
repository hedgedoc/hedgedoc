/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentEdits } from '../editor-pane/tool-bar/formatters/types/changes'
import type { CursorSelection } from '../editor-pane/tool-bar/formatters/types/cursor-selection'
import { useCodemirrorReferenceContext } from './codemirror-reference-context'
import type { EditorView } from '@codemirror/view'
import { Optional } from '@mrdrogdrog/optional'
import { useMemo } from 'react'

export type ContentFormatter = (parameters: {
  currentSelection: CursorSelection
  markdownContent: string
}) => [ContentEdits, CursorSelection | undefined]

/**
 * Changes the content of the given CodeMirror view using the given formatter function.
 *
 * @param view The CodeMirror view whose content should be changed
 * @param formatter A function that generates changes that get dispatched to CodeMirror
 */
export const changeEditorContent = (view: EditorView, formatter: ContentFormatter): void => {
  const [changes, selection] = formatter({
    currentSelection: {
      from: view.state.selection.main.from,
      to: view.state.selection.main.to
    },
    markdownContent: view.state.doc.toString()
  })

  view.dispatch({ changes: changes, selection: convertSelectionToCodeMirrorSelection(selection) })
}

/**
 * Provides a {@link ContentFormatter formatter function} that is linked to the current CodeMirror-View
 * @see changeEditorContent
 */
export const useChangeEditorContentCallback = () => {
  const [codeMirrorRef] = useCodemirrorReferenceContext()
  return useMemo(() => {
    return !codeMirrorRef ? null : (callback: ContentFormatter) => changeEditorContent(codeMirrorRef, callback)
  }, [codeMirrorRef])
}

const convertSelectionToCodeMirrorSelection = (selection: CursorSelection | undefined) => {
  return Optional.ofNullable(selection)
    .map((selection) => ({ anchor: selection.from, head: selection.to }))
    .orElse(undefined)
}
