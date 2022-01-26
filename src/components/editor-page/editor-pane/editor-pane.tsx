/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Editor, EditorChange } from 'codemirror'
import React, { useCallback, useRef } from 'react'
import type { ScrollProps } from '../synced-scroll/scroll-props'
import { StatusBar } from './status-bar/status-bar'
import { ToolBar } from './tool-bar/tool-bar'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { setNoteContent } from '../../../redux/note-details/methods'
import { useNoteMarkdownContent } from '../../../hooks/common/use-note-markdown-content'
import { useCodeMirrorOptions } from './hooks/use-code-mirror-options'
import { useOnEditorPasteCallback } from './hooks/use-on-editor-paste-callback'
import { useOnEditorFileDrop } from './hooks/use-on-editor-file-drop'
import { useOnEditorScroll } from './hooks/use-on-editor-scroll'
import { useApplyScrollState } from './hooks/use-apply-scroll-state'
import { MaxLengthWarning } from './max-length-warning/max-length-warning'
import { useOnImageUploadFromRenderer } from './hooks/use-on-image-upload-from-renderer'
import { ExtendedCodemirror } from './extended-codemirror/extended-codemirror'
import { useCursorActivityCallback } from './hooks/use-cursor-activity-callback'

export const EditorPane: React.FC<ScrollProps> = ({ scrollState, onScroll, onMakeScrollSource }) => {
  const markdownContent = useNoteMarkdownContent()

  const editor = useRef<Editor>()
  const ligaturesEnabled = useApplicationState((state) => state.editorConfig.ligatures)

  const onPaste = useOnEditorPasteCallback()
  const onEditorScroll = useOnEditorScroll(onScroll)
  useApplyScrollState(editor, scrollState)

  const onBeforeChange = useCallback((editor: Editor, data: EditorChange, value: string) => {
    setNoteContent(value)
  }, [])

  useOnImageUploadFromRenderer()

  const onEditorDidMount = useCallback((mountedEditor: Editor) => {
    editor.current = mountedEditor
  }, [])

  const onCursorActivity = useCursorActivityCallback()
  const onDrop = useOnEditorFileDrop()
  const codeMirrorOptions = useCodeMirrorOptions()

  const editorFocus = useRef<boolean>(false)
  const onFocus = useCallback(() => {
    editorFocus.current = true
    if (editor.current) {
      onCursorActivity(editor.current)
    }
  }, [editor, onCursorActivity])

  const onBlur = useCallback(() => {
    editorFocus.current = false
  }, [])

  const cursorActivity = useCallback(
    (editor: Editor) => {
      if (editorFocus.current) {
        onCursorActivity(editor)
      }
    },
    [onCursorActivity]
  )

  return (
    <div className={`d-flex flex-column h-100 position-relative`} onMouseEnter={onMakeScrollSource}>
      <MaxLengthWarning />
      <ToolBar />
      <ExtendedCodemirror
        className={`overflow-hidden w-100 flex-fill`}
        value={markdownContent}
        options={codeMirrorOptions}
        onPaste={onPaste}
        onDrop={onDrop}
        onCursorActivity={cursorActivity}
        editorDidMount={onEditorDidMount}
        onBeforeChange={onBeforeChange}
        onScroll={onEditorScroll}
        onFocus={onFocus}
        onBlur={onBlur}
        ligatures={ligaturesEnabled}
      />
      <StatusBar />
    </div>
  )
}

export default EditorPane
