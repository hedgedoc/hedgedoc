/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import type { Extension } from '@codemirror/state'
import { useMemo } from 'react'
import { indentUnit } from '@codemirror/language'

/**
 * Creates a {@link Extension codemirror extension} that manages the indentation config.
 */
export const useCodeMirrorIndentationExtension = (): Extension => {
  const indentWithTabs = useApplicationState((state) => state.editorConfig.indentWithTabs)
  const indentSpaces = useApplicationState((state) => state.editorConfig.indentSpaces)

  return useMemo(() => indentUnit.of(indentWithTabs ? '\t' : ' '.repeat(indentSpaces)), [indentWithTabs, indentSpaces])
}
