import 'codemirror/addon/comment/comment'
import 'codemirror/addon/display/placeholder'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/continuelist'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/edit/matchtags'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/search/match-highlighter'
import 'codemirror/addon/selection/active-line'
import 'codemirror/keymap/sublime.js'
import 'codemirror/mode/gfm/gfm.js'
import React, { useState } from 'react'
import { Controlled as ControlledCodeMirror } from 'react-codemirror2'
import { useTranslation } from 'react-i18next'
import './editor-window.scss'

const EditorWindow: React.FC = () => {
  const { t } = useTranslation()

  const [content, setContent] = useState<string>('')
  return (
    <ControlledCodeMirror
      className="h-100 w-100"
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
        //    continueComments: 'Enter',
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
        // extraKeys: this.defaultExtraKeys,
        flattenSpans: true,
        addModeClass: true,
        // autoRefresh: true,
        // otherCursors: true
        placeholder: t('editor.placeholder')
      }
      }
      onBeforeChange={(editor, data, value) => {
        setContent(value)
      }}
      onChange={(editor, data, value) => {
        console.log('change!')
      }}
    />
  )
}

export { EditorWindow }
