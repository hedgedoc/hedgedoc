/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { EditorState } from '@codemirror/state'
import { Optional } from '@mrdrogdrog/optional'

/**
 * Extracts the currently selected text from the given CodeMirror state.
 *
 * @param state The CodeMirror state that provides the content and the selection
 * @return The selected text or {@link undefined} if no text was selected
 */
export const extractSelectedText = (state: EditorState): string | undefined => {
  return Optional.ofNullable(state.selection.main)
    .map((selection) => [selection.from, selection.to])
    .filter(([from, to]) => from !== to)
    .map(([from, to]) => state.sliceDoc(from, to))
    .orElse(undefined)
}
