/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { EditorConfiguration } from 'codemirror'
import { useMemo } from 'react'
import { createDefaultKeyMap } from '../key-map'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { useTranslation } from 'react-i18next'

/**
 * Generates the configuration for a CodeMirror instance.
 */
export const useCodeMirrorOptions = (): EditorConfiguration => {
  const editorPreferences = useApplicationState((state) => state.editorConfig.preferences)
  const { t } = useTranslation()

  return useMemo<EditorConfiguration>(
    () => ({
      ...editorPreferences,
      mode: 'gfm',
      viewportMargin: 20,
      styleActiveLine: true,
      lineNumbers: true,
      lineWrapping: true,
      showCursorWhenSelecting: true,
      highlightSelectionMatches: true,
      inputStyle: 'textarea',
      matchBrackets: true,
      autoCloseBrackets: true,
      matchTags: {
        bothTags: true
      },
      autoCloseTags: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'authorship-gutters', 'CodeMirror-foldgutter'],
      extraKeys: createDefaultKeyMap(),
      flattenSpans: true,
      addModeClass: true,
      autoRefresh: true,
      // otherCursors: true,
      placeholder: t('editor.placeholder')
    }),
    [t, editorPreferences]
  )
}
