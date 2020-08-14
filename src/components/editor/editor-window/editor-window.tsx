import { Editor, EditorChange } from 'codemirror'
import 'codemirror/addon/comment/comment'
import 'codemirror/addon/display/autorefresh'
import 'codemirror/addon/display/fullscreen'
import 'codemirror/addon/display/placeholder'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/continuelist'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/edit/matchtags'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/search/match-highlighter'
import 'codemirror/addon/selection/active-line'
import 'codemirror/keymap/sublime.js'
import 'codemirror/mode/gfm/gfm.js'
import React, { useCallback, useState } from 'react'
import { Controlled as ControlledCodeMirror } from 'react-codemirror2'
import { useTranslation } from 'react-i18next'
import './editor-window.scss'
import { emojiHints, emojiWordRegex, findWordAtCursor } from './hints/emoji'
import { defaultKeyMap } from './key-map'
import { ToolBar } from './tool-bar/tool-bar'

export interface EditorWindowProps {
  onContentChange: (content: string) => void
  content: string
}

const hintOptions = {
  hint: emojiHints,
  completeSingle: false,
  completeOnSingleClick: false,
  alignWithWord: true
}

const onChange = (editor: Editor) => {
  const searchTerm = findWordAtCursor(editor)
  if (emojiWordRegex.test(searchTerm.text)) {
    editor.showHint(hintOptions)
  }
}

export const EditorWindow: React.FC<EditorWindowProps> = ({ onContentChange, content }) => {
  const { t } = useTranslation()
  const [editor, setEditor] = useState<Editor>()

  const onBeforeChange = useCallback((editor: Editor, data: EditorChange, value: string) => {
    onContentChange(value)
  }, [onContentChange])

  return (
    <div className={'d-flex flex-column h-100'}>
      <ToolBar
        editor={editor}
      />
      <ControlledCodeMirror
        className="overflow-hidden w-100 flex-fill"
        value={content}
        options={{
          mode: 'gfm',
          theme: 'one-dark',
          keyMap: 'sublime',
          viewportMargin: 20,
          styleActiveLine: true,
          lineNumbers: true,
          lineWrapping: true,
          showCursorWhenSelecting: true,
          highlightSelectionMatches: true,
          indentUnit: 4,
          inputStyle: 'textarea',
          matchBrackets: true,
          autoCloseBrackets: true,
          matchTags: {
            bothTags: true
          },
          autoCloseTags: true,
          foldGutter: true,
          gutters: [
            'CodeMirror-linenumbers',
            'authorship-gutters',
            'CodeMirror-foldgutter'
          ],
          extraKeys: defaultKeyMap,
          flattenSpans: true,
          addModeClass: true,
          autoRefresh: true,
          // otherCursors: true,
          placeholder: t('editor.placeholder'),
          showHint: false,
          hintOptions: hintOptions
        }}
        editorDidMount={mountedEditor => setEditor(mountedEditor)}
        onBeforeChange={onBeforeChange}
        onChange={onChange}
      /></div>
  )
}
