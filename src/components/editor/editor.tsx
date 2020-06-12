import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import useMedia from 'use-media'
import { ApplicationState } from '../../redux'
import { setEditorModeConfig } from '../../redux/editor/methods'
import { Splitter } from '../common/splitter/splitter'
import { EditorWindow } from './editor-window/editor-window'
import { MarkdownPreview } from './markdown-preview/markdown-preview'
import { EditorMode } from './task-bar/editor-view-mode'
import { TaskBar } from './task-bar/task-bar'

interface RouteParameters {
  id: string
}

const Editor: React.FC = () => {
  const editorMode: EditorMode = useSelector((state: ApplicationState) => state.editorConfig.editorMode)
  const isWide = useMedia({ minWidth: 576 })
  const [firstDraw, setFirstDraw] = useState(true)

  useEffect(() => {
    setFirstDraw(false)
  }, [])

  useEffect(() => {
    if (!firstDraw && !isWide && editorMode === EditorMode.BOTH) {
      setEditorModeConfig(EditorMode.PREVIEW)
    }
  }, [editorMode, firstDraw, isWide])

  return (
    <div className={'d-flex flex-column vh-100'}>
      <TaskBar/>
      <Splitter
        showLeft={editorMode === EditorMode.EDITOR || editorMode === EditorMode.BOTH}
        left={<EditorWindow/>}
        showRight={editorMode === EditorMode.PREVIEW || (editorMode === EditorMode.BOTH)}
        right={<MarkdownPreview/>}
        containerClassName={'overflow-hidden'}/>
    </div>
  )
}

export { Editor }
