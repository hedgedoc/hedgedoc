/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react'
import type { ScrollProps } from '../synced-scroll/scroll-props'
import { StatusBar } from './status-bar/status-bar'
import { ToolBar } from './tool-bar/tool-bar'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { setNoteContent } from '../../../redux/note-details/methods'
import { useNoteMarkdownContent } from '../../../hooks/common/use-note-markdown-content'
import { MaxLengthWarning } from './max-length-warning/max-length-warning'
import ReactCodeMirror from '@uiw/react-codemirror'
import { useApplyScrollState } from './hooks/use-apply-scroll-state'
import styles from './extended-codemirror/codemirror.module.scss'
import { oneDark } from '@codemirror/theme-one-dark'
import { useTranslation } from 'react-i18next'
import { useCodeMirrorScrollWatchExtension } from './hooks/code-mirror-extensions/use-code-mirror-scroll-watch-extension'
import { useCodeMirrorFileInsertExtension } from './hooks/code-mirror-extensions/use-code-mirror-file-insert-extension'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { EditorView } from '@codemirror/view'
import { autocompletion } from '@codemirror/autocomplete'
import { cypressAttribute, cypressId } from '../../../utils/cypress-attribute'
import { findLanguageByCodeBlockName } from '../../markdown-renderer/markdown-extension/code-block-markdown-extension/find-language-by-code-block-name'
import { languages } from '@codemirror/language-data'
import { useCursorActivityCallback } from './hooks/use-cursor-activity-callback'
import { useCodeMirrorReference, useSetCodeMirrorReference } from '../change-content-context/change-content-context'
import { useCodeMirrorTablePasteExtension } from './hooks/table-paste/use-code-mirror-table-paste-extension'
import { useOnImageUploadFromRenderer } from './hooks/image-upload-from-renderer/use-on-image-upload-from-renderer'

export const EditorPane: React.FC<ScrollProps> = ({ scrollState, onScroll, onMakeScrollSource }) => {
  const markdownContent = useNoteMarkdownContent()

  const ligaturesEnabled = useApplicationState((state) => state.editorConfig.ligatures)

  useApplyScrollState(scrollState)

  const editorScrollExtension = useCodeMirrorScrollWatchExtension(onScroll)
  const tablePasteExtensions = useCodeMirrorTablePasteExtension()
  const fileInsertExtension = useCodeMirrorFileInsertExtension()
  const cursorActivityExtension = useCursorActivityCallback()

  const onBeforeChange = useCallback((value: string): void => {
    setNoteContent(value)
  }, [])

  const codeMirrorRef = useCodeMirrorReference()
  const setCodeMirrorReference = useSetCodeMirrorReference()

  const updateViewContext = useMemo(() => {
    return EditorView.updateListener.of((update) => {
      if (codeMirrorRef !== update.view) {
        setCodeMirrorReference(update.view)
      }
    })
  }, [codeMirrorRef, setCodeMirrorReference])

  const extensions = useMemo(
    () => [
      markdown({
        base: markdownLanguage,
        codeLanguages: (input) => findLanguageByCodeBlockName(languages, input)
      }),
      EditorView.lineWrapping,
      editorScrollExtension,
      tablePasteExtensions,
      fileInsertExtension,
      autocompletion(),
      cursorActivityExtension,
      updateViewContext
    ],
    [cursorActivityExtension, fileInsertExtension, tablePasteExtensions, editorScrollExtension, updateViewContext]
  )

  useOnImageUploadFromRenderer()

  const codeMirrorClassName = useMemo(
    () => `overflow-hidden ${styles.extendedCodemirror} h-100 ${ligaturesEnabled ? '' : styles['no-ligatures']}`,
    [ligaturesEnabled]
  )

  const { t } = useTranslation()

  return (
    <div
      className={`d-flex flex-column h-100 position-relative`}
      onTouchStart={onMakeScrollSource}
      onMouseEnter={onMakeScrollSource}
      {...cypressId('editor-pane')}
      {...cypressAttribute('editor-ready', String(codeMirrorRef !== undefined))}>
      <MaxLengthWarning />
      <ToolBar />
      <ReactCodeMirror
        placeholder={t('editor.placeholder')}
        extensions={extensions}
        width={'100%'}
        height={'100%'}
        maxHeight={'100%'}
        maxWidth={'100%'}
        basicSetup={true}
        className={codeMirrorClassName}
        theme={oneDark}
        value={markdownContent}
        onChange={onBeforeChange}
      />
      <StatusBar />
    </div>
  )
}
