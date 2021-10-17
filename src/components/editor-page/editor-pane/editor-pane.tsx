/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Editor, EditorChange } from 'codemirror'
import React, { useCallback, useRef, useState } from 'react'
import { Controlled as ControlledCodeMirror } from 'react-codemirror2'
import { MaxLengthWarningModal } from '../editor-modals/max-length-warning-modal'
import type { ScrollProps } from '../synced-scroll/scroll-props'
import { allHinters, findWordAtCursor } from './autocompletion'
import './editor-pane.scss'
import type { StatusBarInfo } from './status-bar/status-bar'
import { createStatusInfo, defaultState, StatusBar } from './status-bar/status-bar'
import { ToolBar } from './tool-bar/tool-bar'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import './codemirror-imports'
import { setNoteContent } from '../../../redux/note-details/methods'
import { useNoteMarkdownContent } from '../../../hooks/common/use-note-markdown-content'
import { useCodeMirrorOptions } from './hooks/use-code-mirror-options'
import { useOnEditorPasteCallback } from './hooks/use-on-editor-paste-callback'
import { useOnEditorFileDrop } from './hooks/use-on-editor-file-drop'
import { useOnEditorScroll } from './hooks/use-on-editor-scroll'
import { useApplyScrollState } from './hooks/use-apply-scroll-state'

const onChange = (editor: Editor) => {
  for (const hinter of allHinters) {
    const searchTerm = findWordAtCursor(editor)
    if (hinter.wordRegExp.test(searchTerm.text)) {
      editor.showHint({
        hint: hinter.hint,
        completeSingle: false,
        completeOnSingleClick: false,
        alignWithWord: true
      })
      return
    }
  }
}

export const EditorPane: React.FC<ScrollProps> = ({ scrollState, onScroll, onMakeScrollSource }) => {
  const markdownContent = useNoteMarkdownContent()
  const maxLength = useApplicationState((state) => state.config.maxDocumentLength)
  const [showMaxLengthWarning, setShowMaxLengthWarning] = useState(false)
  const maxLengthWarningAlreadyShown = useRef(false)
  const [editor, setEditor] = useState<Editor>()
  const [statusBarInfo, setStatusBarInfo] = useState<StatusBarInfo>(defaultState)
  const ligaturesEnabled = useApplicationState((state) => state.editorConfig.ligatures)

  const onPaste = useOnEditorPasteCallback()
  const onEditorScroll = useOnEditorScroll(onScroll)
  useApplyScrollState(editor, scrollState)

  const onBeforeChange = useCallback(
    (editor: Editor, data: EditorChange, value: string) => {
      if (value.length > maxLength && !maxLengthWarningAlreadyShown.current) {
        setShowMaxLengthWarning(true)
        maxLengthWarningAlreadyShown.current = true
      }
      if (value.length <= maxLength) {
        maxLengthWarningAlreadyShown.current = false
      }
      setNoteContent(value)
    },
    [maxLength]
  )

  const onEditorDidMount = useCallback(
    (mountedEditor: Editor) => {
      setStatusBarInfo(createStatusInfo(mountedEditor, maxLength))
      setEditor(mountedEditor)
    },
    [maxLength]
  )

  const onCursorActivity = useCallback(
    (editorWithActivity: Editor) => {
      setStatusBarInfo(createStatusInfo(editorWithActivity, maxLength))
    },
    [maxLength]
  )

  const onDrop = useOnEditorFileDrop()
  const onMaxLengthHide = useCallback(() => setShowMaxLengthWarning(false), [])
  const codeMirrorOptions = useCodeMirrorOptions()

  return (
    <div className={'d-flex flex-column h-100 position-relative'} onMouseEnter={onMakeScrollSource}>
      <MaxLengthWarningModal show={showMaxLengthWarning} onHide={onMaxLengthHide} maxLength={maxLength} />
      <ToolBar editor={editor} />
      <ControlledCodeMirror
        className={`overflow-hidden w-100 flex-fill ${ligaturesEnabled ? '' : 'no-ligatures'}`}
        value={markdownContent}
        options={codeMirrorOptions}
        onChange={onChange}
        onPaste={onPaste}
        onDrop={onDrop}
        onCursorActivity={onCursorActivity}
        editorDidMount={onEditorDidMount}
        onBeforeChange={onBeforeChange}
        onScroll={onEditorScroll}
      />
      <StatusBar {...statusBarInfo} />
    </div>
  )
}
