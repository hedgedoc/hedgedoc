/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Editor, EditorChange } from 'codemirror'
import React, { useCallback, useState } from 'react'
import { Controlled as ControlledCodeMirror } from 'react-codemirror2'
import type { ScrollProps } from '../synced-scroll/scroll-props'
import { allHinters, findWordAtCursor } from './autocompletion'
import './editor-pane.scss'
import { StatusBar } from './status-bar/status-bar'
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
import { MaxLengthWarning } from './max-length-warning/max-length-warning'
import { useCreateStatusBarInfo } from './hooks/use-create-status-bar-info'
import { useOnImageUploadFromRenderer } from './hooks/use-on-image-upload-from-renderer'

const onChange = (editor: Editor) => {
  const searchTerm = findWordAtCursor(editor)
  for (const hinter of allHinters) {
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

  const [editor, setEditor] = useState<Editor>()
  const ligaturesEnabled = useApplicationState((state) => state.editorConfig.ligatures)

  const onPaste = useOnEditorPasteCallback()
  const onEditorScroll = useOnEditorScroll(onScroll)
  useApplyScrollState(editor, scrollState)

  const onBeforeChange = useCallback((editor: Editor, data: EditorChange, value: string) => {
    setNoteContent(value)
  }, [])

  const [statusBarInfo, updateStatusBarInfo] = useCreateStatusBarInfo()

  useOnImageUploadFromRenderer(editor)

  const onEditorDidMount = useCallback(
    (mountedEditor: Editor) => {
      updateStatusBarInfo(mountedEditor)
      setEditor(mountedEditor)
    },
    [updateStatusBarInfo]
  )

  const onDrop = useOnEditorFileDrop()
  const codeMirrorOptions = useCodeMirrorOptions()

  return (
    <div className={'d-flex flex-column h-100 position-relative'} onMouseEnter={onMakeScrollSource}>
      <MaxLengthWarning />
      <ToolBar editor={editor} />
      <ControlledCodeMirror
        className={`overflow-hidden w-100 flex-fill ${ligaturesEnabled ? '' : 'no-ligatures'}`}
        value={markdownContent}
        options={codeMirrorOptions}
        onChange={onChange}
        onPaste={onPaste}
        onDrop={onDrop}
        onCursorActivity={updateStatusBarInfo}
        editorDidMount={onEditorDidMount}
        onBeforeChange={onBeforeChange}
        onScroll={onEditorScroll}
      />
      <StatusBar statusBarInfo={statusBarInfo} />
    </div>
  )
}
