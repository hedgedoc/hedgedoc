/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Editor, EditorChange, EditorConfiguration, ScrollInfo } from 'codemirror'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controlled as ControlledCodeMirror } from 'react-codemirror2'
import { useTranslation } from 'react-i18next'
import { MaxLengthWarningModal } from '../editor-modals/max-length-warning-modal'
import { ScrollProps, ScrollState } from '../synced-scroll/scroll-props'
import { allHinters, findWordAtCursor } from './autocompletion'
import './editor-pane.scss'
import { defaultKeyMap } from './key-map'
import { createStatusInfo, defaultState, StatusBar, StatusBarInfo } from './status-bar/status-bar'
import { ToolBar } from './tool-bar/tool-bar'
import { handleUpload } from './upload-handler'
import { handleFilePaste, handleTablePaste, PasteEvent } from './tool-bar/utils/pasteHandlers'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import './codemirror-imports'
import { setNoteContent } from '../../../redux/note-details/methods'
import { useNoteMarkdownContent } from '../../../hooks/common/use-note-markdown-content'

export interface EditorPaneProps {
  onContentChange: (content: string) => void
  content: string
}

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

interface DropEvent {
  pageX: number
  pageY: number
  dataTransfer: {
    files: FileList
    effectAllowed: string
  } | null
  preventDefault: () => void
}

export const EditorPane: React.FC<ScrollProps> = ({ scrollState, onScroll, onMakeScrollSource }) => {
  const markdownContent = useNoteMarkdownContent()
  const { t } = useTranslation()
  const maxLength = useApplicationState((state) => state.config.maxDocumentLength)
  const smartPasteEnabled = useApplicationState((state) => state.editorConfig.smartPaste)
  const [showMaxLengthWarning, setShowMaxLengthWarning] = useState(false)
  const maxLengthWarningAlreadyShown = useRef(false)
  const [editor, setEditor] = useState<Editor>()
  const [statusBarInfo, setStatusBarInfo] = useState<StatusBarInfo>(defaultState)
  const editorPreferences = useApplicationState((state) => state.editorConfig.preferences)
  const ligaturesEnabled = useApplicationState((state) => state.editorConfig.ligatures)

  const lastScrollPosition = useRef<number>()
  const [editorScroll, setEditorScroll] = useState<ScrollInfo>()
  const onEditorScroll = useCallback((editor: Editor, data: ScrollInfo) => setEditorScroll(data), [])

  const onPaste = useCallback(
    (pasteEditor: Editor, event: PasteEvent) => {
      if (!event || !event.clipboardData) {
        return
      }
      if (smartPasteEnabled) {
        const tableInserted = handleTablePaste(event, pasteEditor)
        if (tableInserted) {
          return
        }
      }
      handleFilePaste(event, pasteEditor)
    },
    [smartPasteEnabled]
  )

  useEffect(() => {
    if (!editor || !onScroll || !editorScroll) {
      return
    }
    const line = editor.lineAtHeight(editorScroll.top, 'local')
    const startYOfLine = editor.heightAtLine(line, 'local')
    const lineInfo = editor.lineInfo(line)
    if (lineInfo === null) {
      return
    }
    const heightOfLine = (lineInfo.handle as { height: number }).height
    const percentageRaw = Math.max(editorScroll.top - startYOfLine, 0) / heightOfLine
    const percentage = Math.floor(percentageRaw * 100)

    const newScrollState: ScrollState = { firstLineInView: line + 1, scrolledPercentage: percentage }
    onScroll(newScrollState)
  }, [editor, editorScroll, onScroll])

  useEffect(() => {
    if (!editor || !scrollState) {
      return
    }
    const startYOfLine = editor.heightAtLine(scrollState.firstLineInView - 1, 'local')
    const heightOfLine = (editor.lineInfo(scrollState.firstLineInView - 1).handle as { height: number }).height
    const newPositionRaw = startYOfLine + (heightOfLine * scrollState.scrolledPercentage) / 100
    const newPosition = Math.floor(newPositionRaw)
    if (newPosition !== lastScrollPosition.current) {
      lastScrollPosition.current = newPosition
      editor.scrollTo(0, newPosition)
    }
  }, [editor, scrollState])

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

  const onDrop = useCallback((dropEditor: Editor, event: DropEvent) => {
    if (
      event &&
      dropEditor &&
      event.pageX &&
      event.pageY &&
      event.dataTransfer &&
      event.dataTransfer.files &&
      event.dataTransfer.files.length >= 1
    ) {
      event.preventDefault()
      const top: number = event.pageY
      const left: number = event.pageX
      const newCursor = dropEditor.coordsChar({ top, left }, 'page')
      dropEditor.setCursor(newCursor)
      const files: FileList = event.dataTransfer.files
      handleUpload(files[0], dropEditor)
    }
  }, [])

  const onMaxLengthHide = useCallback(() => setShowMaxLengthWarning(false), [])

  const codeMirrorOptions: EditorConfiguration = useMemo<EditorConfiguration>(
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
      extraKeys: defaultKeyMap,
      flattenSpans: true,
      addModeClass: true,
      autoRefresh: true,
      // otherCursors: true,
      placeholder: t('editor.placeholder')
    }),
    [t, editorPreferences]
  )

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
