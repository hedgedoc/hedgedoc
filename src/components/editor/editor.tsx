import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import useMedia from 'use-media'
import { ApplicationState } from '../../redux'
import { setEditorModeConfig } from '../../redux/editor/methods'
import { DocumentTitle } from '../common/document-title/document-title'
import { Splitter } from '../common/splitter/splitter'
import { InfoBanner } from '../landing/layout/info-banner'
import { EditorWindow } from './editor-window/editor-window'
import { editorTestContent } from './editorTestContent'
import { MarkdownRenderWindow } from './renderer-window/markdown-render-window'
import { EditorMode } from './task-bar/editor-view-mode'
import { TaskBar } from './task-bar/task-bar'
import { YAMLMetaData } from './yaml-metadata/yaml-metadata'

export const Editor: React.FC = () => {
  const { t } = useTranslation()
  const untitledNote = t('editor.untitledNote')
  const editorMode: EditorMode = useSelector((state: ApplicationState) => state.editorConfig.editorMode)
  const [markdownContent, setMarkdownContent] = useState(editorTestContent)
  const isWide = useMedia({ minWidth: 576 })
  const [firstDraw, setFirstDraw] = useState(true)
  const [documentTitle, setDocumentTitle] = useState(untitledNote)
  const noteMetadata = useRef<YAMLMetaData>()
  const firstHeading = useRef<string>()

  const updateDocumentTitle = useCallback(() => {
    if (noteMetadata.current?.title && noteMetadata.current?.title !== '') {
      setDocumentTitle(noteMetadata.current.title)
    } else if (noteMetadata.current?.opengraph && noteMetadata.current?.opengraph.get('title') && noteMetadata.current?.opengraph.get('title') !== '') {
      setDocumentTitle(noteMetadata.current.opengraph.get('title') ?? untitledNote)
    } else {
      setDocumentTitle(firstHeading.current ?? untitledNote)
    }
  }, [untitledNote])

  const onMetadataChange = useCallback((metaData: YAMLMetaData | undefined) => {
    noteMetadata.current = metaData
    updateDocumentTitle()
  }, [updateDocumentTitle])

  const onFirstHeadingChange = useCallback((newFirstHeading: string | undefined) => {
    firstHeading.current = newFirstHeading
    updateDocumentTitle()
  }, [updateDocumentTitle])

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
      <DocumentTitle title={documentTitle}/>
      <div className={'d-flex flex-column vh-100'}>
        <TaskBar/>
        <Splitter
          showLeft={editorMode === EditorMode.EDITOR || editorMode === EditorMode.BOTH}
          left={<EditorWindow onContentChange={content => setMarkdownContent(content)} content={markdownContent}/>}
          showRight={editorMode === EditorMode.PREVIEW || (editorMode === EditorMode.BOTH)}
          right={<MarkdownRenderWindow content={markdownContent} wide={editorMode === EditorMode.PREVIEW} onMetadataChange={onMetadataChange} onFirstHeadingChange={onFirstHeadingChange}/>}
          containerClassName={'overflow-hidden'}/>
      </div>
    </Fragment>
  )
}
