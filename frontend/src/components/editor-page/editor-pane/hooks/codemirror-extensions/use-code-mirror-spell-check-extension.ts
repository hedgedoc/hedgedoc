/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useMemo } from 'react'

/**
 * Creates a {@link Extension codemirror extension} that activates or deactivates the browser spell check.
 */
export const useCodeMirrorSpellCheckExtension = (): Extension => {
  const spellCheck = useApplicationState((state) => state.editorConfig.spellCheck)

  return useMemo(() => EditorView.contentAttributes.of({ spellcheck: String(spellCheck) }), [spellCheck])
}
