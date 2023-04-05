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
 * Creates a {@link Extension codemirror extension} that activates or deactivates line wrapping.
 */
export const useCodeMirrorLineWrappingExtension = (): Extension => {
  const lineWrapping = useApplicationState((state) => state.editorConfig.lineWrapping)

  return useMemo(() => (lineWrapping ? EditorView.lineWrapping : []), [lineWrapping])
}
