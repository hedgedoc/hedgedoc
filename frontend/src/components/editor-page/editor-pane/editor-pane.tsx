/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { useDarkModeState } from '../../../hooks/common/use-dark-mode-state'
import { cypressAttribute, cypressId } from '../../../utils/cypress-attribute'
import { findLanguageByCodeBlockName } from '../../markdown-renderer/extensions/base/code-block-markdown-extension/find-language-by-code-block-name'
import { useCodeMirrorReference, useSetCodeMirrorReference } from '../change-content-context/change-content-context'
import type { ScrollProps } from '../synced-scroll/scroll-props'
import styles from './extended-codemirror/codemirror.module.scss'
import { useCodeMirrorFileInsertExtension } from './hooks/code-mirror-extensions/use-code-mirror-file-insert-extension'
import { useCodeMirrorScrollWatchExtension } from './hooks/code-mirror-extensions/use-code-mirror-scroll-watch-extension'
import { useOnImageUploadFromRenderer } from './hooks/image-upload-from-renderer/use-on-image-upload-from-renderer'
import { useCodeMirrorTablePasteExtension } from './hooks/table-paste/use-code-mirror-table-paste-extension'
import { useApplyScrollState } from './hooks/use-apply-scroll-state'
import { useCursorActivityCallback } from './hooks/use-cursor-activity-callback'
import { useAwareness } from './hooks/yjs/use-awareness'
import { useBindYTextToRedux } from './hooks/yjs/use-bind-y-text-to-redux'
import { useCodeMirrorYjsExtension } from './hooks/yjs/use-code-mirror-yjs-extension'
import { useInsertNoteContentIntoYTextInMockModeEffect } from './hooks/yjs/use-insert-note-content-into-y-text-in-mock-mode-effect'
import { useIsConnectionSynced } from './hooks/yjs/use-is-connection-synced'
import { useMarkdownContentYText } from './hooks/yjs/use-markdown-content-y-text'
import { useOnFirstEditorUpdateExtension } from './hooks/yjs/use-on-first-editor-update-extension'
import { useOnMetadataUpdated } from './hooks/yjs/use-on-metadata-updated'
import { useOnNoteDeleted } from './hooks/yjs/use-on-note-deleted'
import { useWebsocketConnection } from './hooks/yjs/use-websocket-connection'
import { useYDoc } from './hooks/yjs/use-y-doc'
import { useLinter } from './linter/linter'
import { MaxLengthWarning } from './max-length-warning/max-length-warning'
import { StatusBar } from './status-bar/status-bar'
import { ToolBar } from './tool-bar/tool-bar'
import { autocompletion } from '@codemirror/autocomplete'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { lintGutter } from '@codemirror/lint'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import ReactCodeMirror from '@uiw/react-codemirror'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Renders the text editor pane of the editor.
 * The used editor is {@link ReactCodeMirror code mirror}.
 *
 * @param scrollState The current {@link ScrollState}
 * @param onScroll The callback to update the {@link ScrollState}
 * @param onMakeScrollSource The callback to request to become the scroll source.
 * @external {ReactCodeMirror} https://npmjs.com/@uiw/react-codemirror
 */
export const EditorPane: React.FC<ScrollProps> = ({ scrollState, onScroll, onMakeScrollSource }) => {
  const ligaturesEnabled = useApplicationState((state) => state.editorConfig.ligatures)

  useApplyScrollState(scrollState)

  const editorScrollExtension = useCodeMirrorScrollWatchExtension(onScroll)
  const tablePasteExtensions = useCodeMirrorTablePasteExtension()
  const fileInsertExtension = useCodeMirrorFileInsertExtension()
  const cursorActivityExtension = useCursorActivityCallback()

  const codeMirrorRef = useCodeMirrorReference()
  const setCodeMirrorReference = useSetCodeMirrorReference()

  const updateViewContext = useMemo(() => {
    return EditorView.updateListener.of((update) => {
      if (codeMirrorRef !== update.view) {
        setCodeMirrorReference(update.view)
      }
    })
  }, [codeMirrorRef, setCodeMirrorReference])

  const yDoc = useYDoc()
  const awareness = useAwareness(yDoc)
  const yText = useMarkdownContentYText(yDoc)
  const websocketConnection = useWebsocketConnection(yDoc, awareness)
  const connectionSynced = useIsConnectionSynced(websocketConnection)
  useBindYTextToRedux(yText)
  useOnMetadataUpdated(websocketConnection)
  useOnNoteDeleted(websocketConnection)

  const yjsExtension = useCodeMirrorYjsExtension(yText, awareness)
  const [firstEditorUpdateExtension, firstUpdateHappened] = useOnFirstEditorUpdateExtension()
  useInsertNoteContentIntoYTextInMockModeEffect(firstUpdateHappened, websocketConnection)
  const spellCheck = useApplicationState((state) => state.editorConfig.spellCheck)
  const linter = useLinter()

  const extensions = useMemo(
    () => [
      linter,
      lintGutter(),
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
      updateViewContext,
      yjsExtension,
      firstEditorUpdateExtension,
      EditorView.contentAttributes.of({ spellcheck: String(spellCheck) })
    ],
    [
      linter,
      editorScrollExtension,
      tablePasteExtensions,
      fileInsertExtension,
      cursorActivityExtension,
      updateViewContext,
      yjsExtension,
      firstEditorUpdateExtension,
      spellCheck
    ]
  )

  useOnImageUploadFromRenderer()

  const codeMirrorClassName = useMemo(
    () => `overflow-hidden ${styles.extendedCodemirror} h-100 ${ligaturesEnabled ? '' : styles['no-ligatures']}`,
    [ligaturesEnabled]
  )

  const { t } = useTranslation()

  const darkModeActivated = useDarkModeState()

  return (
    <div
      className={`d-flex flex-column h-100 position-relative`}
      onTouchStart={onMakeScrollSource}
      onMouseEnter={onMakeScrollSource}
      {...cypressId('editor-pane')}
      {...cypressAttribute('editor-ready', String(firstUpdateHappened && connectionSynced))}>
      <MaxLengthWarning />
      <ToolBar />
      <ReactCodeMirror
        editable={firstUpdateHappened && connectionSynced}
        placeholder={t('editor.placeholder') ?? ''}
        extensions={extensions}
        width={'100%'}
        height={'100%'}
        maxHeight={'100%'}
        maxWidth={'100%'}
        basicSetup={true}
        className={codeMirrorClassName}
        theme={darkModeActivated ? oneDark : undefined}
      />
      <StatusBar />
    </div>
  )
}
