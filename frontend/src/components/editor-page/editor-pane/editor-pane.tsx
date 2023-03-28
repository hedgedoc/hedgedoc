/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { ORIGIN, useBaseUrl } from '../../../hooks/common/use-base-url'
import { useDarkModeState } from '../../../hooks/common/use-dark-mode-state'
import { cypressAttribute, cypressId } from '../../../utils/cypress-attribute'
import { findLanguageByCodeBlockName } from '../../markdown-renderer/extensions/base/code-block-markdown-extension/find-language-by-code-block-name'
import type { ScrollProps } from '../synced-scroll/scroll-props'
import styles from './extended-codemirror/codemirror.module.scss'
import { useCodeMirrorAutocompletionsExtension } from './hooks/codemirror-extensions/use-code-mirror-autocompletions-extension'
import { useCodeMirrorFileInsertExtension } from './hooks/codemirror-extensions/use-code-mirror-file-insert-extension'
import { useCodeMirrorRemoteCursorsExtension } from './hooks/codemirror-extensions/use-code-mirror-remote-cursor-extensions'
import { useCodeMirrorScrollWatchExtension } from './hooks/codemirror-extensions/use-code-mirror-scroll-watch-extension'
import { useCodeMirrorSpellCheckExtension } from './hooks/codemirror-extensions/use-code-mirror-spell-check-extension'
import { useOnImageUploadFromRenderer } from './hooks/image-upload-from-renderer/use-on-image-upload-from-renderer'
import { useCodeMirrorTablePasteExtension } from './hooks/table-paste/use-code-mirror-table-paste-extension'
import { useApplyScrollState } from './hooks/use-apply-scroll-state'
import { useCursorActivityCallback } from './hooks/use-cursor-activity-callback'
import { useDisconnectOnUserLoginStatusChange } from './hooks/use-disconnect-on-user-login-status-change'
import { useUpdateCodeMirrorReference } from './hooks/use-update-code-mirror-reference'
import { useBindYTextToRedux } from './hooks/yjs/use-bind-y-text-to-redux'
import { useCodeMirrorYjsExtension } from './hooks/yjs/use-code-mirror-yjs-extension'
import { useOnMetadataUpdated } from './hooks/yjs/use-on-metadata-updated'
import { useOnNoteDeleted } from './hooks/yjs/use-on-note-deleted'
import { useRealtimeConnection } from './hooks/yjs/use-realtime-connection'
import { useRealtimeDoc } from './hooks/yjs/use-realtime-doc'
import { useReceiveRealtimeUsers } from './hooks/yjs/use-receive-realtime-users'
import { useYDocSyncClientAdapter } from './hooks/yjs/use-y-doc-sync-client-adapter'
import { useLinter } from './linter/linter'
import { MaxLengthWarning } from './max-length-warning/max-length-warning'
import { StatusBar } from './status-bar/status-bar'
import { ToolBar } from './tool-bar/tool-bar'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { lintGutter } from '@codemirror/lint'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import ReactCodeMirror from '@uiw/react-codemirror'
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export type EditorPaneProps = ScrollProps

/**
 * Renders the text editor pane of the editor.
 * The used editor is {@link ReactCodeMirror code mirror}.
 *
 * @param scrollState The current {@link ScrollState}
 * @param onScroll The callback to update the {@link ScrollState}
 * @param onMakeScrollSource The callback to request to become the scroll source.
 * @external {ReactCodeMirror} https://npmjs.com/@uiw/react-codemirror
 */
export const EditorPane: React.FC<EditorPaneProps> = ({ scrollState, onScroll, onMakeScrollSource }) => {
  useApplyScrollState(scrollState)

  const messageTransporter = useRealtimeConnection()

  useDisconnectOnUserLoginStatusChange(messageTransporter)

  const realtimeDoc = useRealtimeDoc()
  const editorScrollExtension = useCodeMirrorScrollWatchExtension(onScroll)
  const tablePasteExtensions = useCodeMirrorTablePasteExtension()
  const fileInsertExtension = useCodeMirrorFileInsertExtension()
  const spellCheckExtension = useCodeMirrorSpellCheckExtension()
  const cursorActivityExtension = useCursorActivityCallback()
  const autoCompletionExtension = useCodeMirrorAutocompletionsExtension()

  const updateViewContextExtension = useUpdateCodeMirrorReference()

  const remoteCursorsExtension = useCodeMirrorRemoteCursorsExtension(messageTransporter)

  const linterExtension = useLinter()

  const syncAdapter = useYDocSyncClientAdapter(messageTransporter, realtimeDoc)
  const yjsExtension = useCodeMirrorYjsExtension(realtimeDoc, syncAdapter)

  useOnMetadataUpdated(messageTransporter)
  useOnNoteDeleted(messageTransporter)

  useBindYTextToRedux(realtimeDoc)
  useReceiveRealtimeUsers(messageTransporter)

  const extensions = useMemo(
    () => [
      linterExtension,
      lintGutter(),
      markdown({
        base: markdownLanguage,
        codeLanguages: (input) => findLanguageByCodeBlockName(languages, input)
      }),
      remoteCursorsExtension,
      EditorView.lineWrapping,
      editorScrollExtension,
      tablePasteExtensions,
      fileInsertExtension,
      autoCompletionExtension,
      cursorActivityExtension,
      updateViewContextExtension,
      yjsExtension,
      spellCheckExtension
    ],
    [
      linterExtension,
      remoteCursorsExtension,
      autoCompletionExtension,
      editorScrollExtension,
      tablePasteExtensions,
      fileInsertExtension,
      cursorActivityExtension,
      updateViewContextExtension,
      yjsExtension,
      spellCheckExtension
    ]
  )

  useOnImageUploadFromRenderer()

  const ligaturesEnabled = useApplicationState((state) => state.editorConfig.ligatures)
  const codeMirrorClassName = useMemo(
    () => `overflow-hidden ${styles.extendedCodemirror} h-100 ${ligaturesEnabled ? '' : styles['no-ligatures']}`,
    [ligaturesEnabled]
  )

  const { t } = useTranslation()
  const darkModeActivated = useDarkModeState()
  const editorOrigin = useBaseUrl(ORIGIN.EDITOR)
  const isSynced = useApplicationState((state) => state.realtimeStatus.isSynced)

  useEffect(() => {
    const listener = messageTransporter.doAsSoonAsConnected(() => messageTransporter.sendReady())
    return () => {
      listener.off()
    }
  }, [messageTransporter])

  return (
    <div
      className={`d-flex flex-column h-100 position-relative`}
      onTouchStart={onMakeScrollSource}
      onMouseEnter={onMakeScrollSource}
      {...cypressId('editor-pane')}
      {...cypressAttribute('editor-ready', String(updateViewContextExtension !== null && isSynced))}>
      <MaxLengthWarning />
      <ToolBar />
      <ReactCodeMirror
        editable={updateViewContextExtension !== null && isSynced}
        placeholder={t('editor.placeholder', { host: editorOrigin }) ?? ''}
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
