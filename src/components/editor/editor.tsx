import React, { Fragment, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import useMedia from 'use-media'
import { ApplicationState } from '../../redux'
import { setEditorModeConfig } from '../../redux/editor/methods'
import { Splitter } from '../common/splitter/splitter'
import { InfoBanner } from '../landing/layout/info-banner'
import { EditorWindow } from './editor-window/editor-window'
import { MarkdownPreview } from './markdown-preview/markdown-preview'
import { EditorMode } from './task-bar/editor-view-mode'
import { TaskBar } from './task-bar/task-bar'

const Editor: React.FC = () => {
  const editorMode: EditorMode = useSelector((state: ApplicationState) => state.editorConfig.editorMode)
  const [markdownContent, setMarkdownContent] = useState('# Embedding demo\n\n## Slideshare\n{%slideshare mazlan1/internet-of-things-the-tip-of-an-iceberg %}\n\n## Gist\nhttps://gist.github.com/schacon/1\n\n## YouTube\nhttps://www.youtube.com/watch?v=KgMpKsp23yY\n\n## Vimeo\nhttps://vimeo.com/23237102')
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
    <Fragment>
      <InfoBanner/>
      <div className={'d-flex flex-column vh-100'}>
        <TaskBar/>
        <Splitter
          showLeft={editorMode === EditorMode.EDITOR || editorMode === EditorMode.BOTH}
          left={<EditorWindow onContentChange={content => setMarkdownContent(content)} content={markdownContent}/>}
          showRight={editorMode === EditorMode.PREVIEW || (editorMode === EditorMode.BOTH)}
          right={<MarkdownPreview content={markdownContent}/>}
          containerClassName={'overflow-hidden'}/>
      </div>
    </Fragment>
  )
}

export { Editor }
