import React from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { ApplicationState } from '../../redux'
import { ShowIf } from '../common/show-if'
import { EditorWindow } from './editor-window/editor-window'
import { MarkdownPreview } from './markdown-preview/markdown-preview'
import { EditorMode } from './task-bar/editor-view-mode'
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
        <ShowIf condition={editorMode === EditorMode.EDITOR || editorMode === EditorMode.BOTH}>
          <EditorWindow/>
        </ShowIf>
        <ShowIf condition={editorMode === EditorMode.PREVIEW || editorMode === EditorMode.BOTH}>
          <MarkdownPreview/>
        </ShowIf>
      </div>
    </div>
  )
}

export { Editor }
