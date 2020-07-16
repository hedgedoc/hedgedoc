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
import React, { useCallback, useState } from 'react'
import { Controlled as ControlledCodeMirror } from 'react-codemirror2'
import { useTranslation } from 'react-i18next'
import './editor-window.scss'
import { Positions, SelectionData } from './interfaces'
import { ToolBar } from './tool-bar/tool-bar'

export interface EditorWindowProps {
  onContentChange: (content: string) => void
  content: string
}

export const EditorWindow: React.FC<EditorWindowProps> = ({ onContentChange, content }) => {
  const { t } = useTranslation()
  const [positions, setPositions] = useState<Positions>({
    startPosition: {
      ch: 0,
      line: 0
    },
    endPosition: {
      ch: 0,
      line: 0
    }
  })

  const onSelection = useCallback((editor, data: SelectionData) => {
    const { anchor, head } = data.ranges[0]
    const headFirst = head.line < anchor.line || (head.line === anchor.line && head.ch < anchor.ch)

    setPositions({
      startPosition: {
        line: headFirst ? head.line : anchor.line,
        ch: headFirst ? head.ch : anchor.ch
      },
      endPosition: {
        line: headFirst ? anchor.line : head.line,
        ch: headFirst ? anchor.ch : head.ch
      }
    })
  }, [])

  return (
    <div className={'d-flex flex-column h-100'}>
      <ToolBar
        content={content}
        onContentChange={onContentChange}
        positions={positions}
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
        }}
        onBeforeChange={(editor, data, value) => {
          onContentChange(value)
        }}
        onSelection={onSelection}
      />
    </div>
  )
}
