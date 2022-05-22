/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo, useRef } from 'react'
import type { ScrollProps } from '../synced-scroll/scroll-props'
import { StatusBar } from './status-bar/status-bar'
import { ToolBar } from './tool-bar/tool-bar'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { setNoteContent } from '../../../redux/note-details/methods'
import { useNoteMarkdownContent } from '../../../hooks/common/use-note-markdown-content'
import { MaxLengthWarning } from './max-length-warning/max-length-warning'
import { useOnImageUploadFromRenderer } from './hooks/use-on-image-upload-from-renderer'
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import ReactCodeMirror from '@uiw/react-codemirror'
import { useCursorActivityCallback } from './hooks/use-cursor-activity-callback'
import { useApplyScrollState } from './hooks/use-apply-scroll-state'
import styles from './extended-codemirror/codemirror.module.scss'
import { oneDark } from '@codemirror/theme-one-dark'
import { useTranslation } from 'react-i18next'
import { Logger } from '../../../utils/logger'
import { useCodeMirrorScrollWatchExtension } from './hooks/code-mirror-extensions/use-code-mirror-scroll-watch-extension'
import { useCodeMirrorPasteExtension } from './hooks/code-mirror-extensions/use-code-mirror-paste-extension'
import { useCodeMirrorFileDropExtension } from './hooks/code-mirror-extensions/use-code-mirror-file-drop-extension'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { EditorView } from '@codemirror/view'
import { autocompletion } from '@codemirror/autocomplete'
import { useCodeMirrorFocusReference } from './hooks/use-code-mirror-focus-reference'
import { useOffScreenScrollProtection } from './hooks/use-off-screen-scroll-protection'
import { cypressId } from '../../../utils/cypress-attribute'
import { findLanguageByCodeBlockName } from '../../markdown-renderer/markdown-extension/code-block-markdown-extension/find-language-by-code-block-name'
import { languages } from '@codemirror/language-data'

const logger = new Logger('EditorPane')

export const EditorPane: React.FC<ScrollProps> = ({ scrollState, onScroll, onMakeScrollSource }) => {
  const markdownContent = useNoteMarkdownContent()

  const ligaturesEnabled = useApplicationState((state) => state.editorConfig.ligatures)
  const codeMirrorRef = useRef<ReactCodeMirrorRef | null>(null)

  useApplyScrollState(codeMirrorRef, scrollState)

  const editorScrollExtension = useCodeMirrorScrollWatchExtension(onScroll)
  const editorPasteExtension = useCodeMirrorPasteExtension()
  const dropExtension = useCodeMirrorFileDropExtension()
  const [focusExtension, editorFocused] = useCodeMirrorFocusReference()
  const saveOffFocusScrollStateExtensions = useOffScreenScrollProtection()
  const cursorActivityExtension = useCursorActivityCallback(editorFocused)

  const onBeforeChange = useCallback(
    (value: string): void => {
      if (!editorFocused.current) {
        logger.debug("Don't post content change because editor isn't focused")
      } else {
        setNoteContent(value)
      }
    },
    [editorFocused]
  )

  const extensions = useMemo(
    () => [
      markdown({
        base: markdownLanguage,
        codeLanguages: (input) => findLanguageByCodeBlockName(languages, input)
      }),
      ...saveOffFocusScrollStateExtensions,
      focusExtension,
      EditorView.lineWrapping,
      editorScrollExtension,
      editorPasteExtension,
      dropExtension,
      autocompletion(),
      cursorActivityExtension
    ],
    [
      cursorActivityExtension,
      dropExtension,
      editorPasteExtension,
      editorScrollExtension,
      focusExtension,
      saveOffFocusScrollStateExtensions
    ]
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
      {...cypressId('editor-pane')}>
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
        ref={codeMirrorRef}
      />
      <StatusBar />
    </div>
  )
}
