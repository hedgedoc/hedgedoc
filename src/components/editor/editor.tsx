import React from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { ApplicationState } from '../../redux'
import { EditorMode } from '../../redux/editor/types'
import { EditorWindow } from './editor-window/editor-window'
import { MarkdownPreview } from './markdown-preview/markdown-preview'
import { TaskBar } from './task-bar/task-bar'

interface RouteParameters {
  id: string
}

const Editor: React.FC = () => {
  const editorMode: EditorMode = useSelector((state: ApplicationState) => state.editorConfig.editorMode)
  const { id } = useParams<RouteParameters>()

  return (
    <div className={'d-flex flex-column vh-100'}>
      <TaskBar/>
      <h1>{id}</h1>
      <div className={'flex-fill flex-row d-flex'}>
        { editorMode === EditorMode.EDITOR || editorMode === EditorMode.BOTH ? <EditorWindow/> : null }
        { editorMode === EditorMode.PREVIEW || editorMode === EditorMode.BOTH ? <MarkdownPreview/> : null }
      </div>
    </div>
  )
}

export { Editor }
