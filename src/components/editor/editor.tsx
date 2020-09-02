import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import useMedia from 'use-media'
import { ApplicationState } from '../../redux'
import { setEditorMode } from '../../redux/editor/methods'
import { DocumentTitle } from '../common/document-title/document-title'
import { MotdBanner } from '../common/motd-banner/motd-banner'
import { AppBar } from './app-bar/app-bar'
import { EditorMode } from './app-bar/editor-view-mode'
import { DocumentBar } from './document-bar/document-bar'
import { DocumentRenderPane } from './document-renderer-pane/document-render-pane'
import { EditorPane } from './editor-pane/editor-pane'
import { editorTestContent } from './editorTestContent'
import { DualScrollState, ScrollState } from './scroll/scroll-props'
import { shortcutHandler } from './shortcut/shortcut'
import { Splitter } from './splitter/splitter'
import { YAMLMetaData } from './yaml-metadata/yaml-metadata'

export interface EditorPathParams {
  id: string
}

export enum ScrollSource {
  EDITOR,
  RENDERER
}

const TASK_REGEX = /(\s*[-*] )(\[[ xX]])( .*)/

export const Editor: React.FC = () => {
  const { t } = useTranslation()
  const untitledNote = t('editor.untitledNote')
  const [markdownContent, setMarkdownContent] = useState(editorTestContent)
  const isWide = useMedia({ minWidth: 576 })
  const [firstDraw, setFirstDraw] = useState(true)
  const [documentTitle, setDocumentTitle] = useState(untitledNote)
  const noteMetadata = useRef<YAMLMetaData>()
  const firstHeading = useRef<string>()
  const scrollSource = useRef<ScrollSource>(ScrollSource.EDITOR)

  const editorMode: EditorMode = useSelector((state: ApplicationState) => state.editorConfig.editorMode)
  const editorSyncScroll: boolean = useSelector((state: ApplicationState) => state.editorConfig.syncScroll)

  const [scrollState, setScrollState] = useState<DualScrollState>(() => ({
    editorScrollState: { firstLineInView: 1, scrolledPercentage: 0 },
    rendererScrollState: { firstLineInView: 1, scrolledPercentage: 0 }
  }))

  const updateDocumentTitle = useCallback(() => {
    if (noteMetadata.current?.title && noteMetadata.current?.title !== '') {
      setDocumentTitle(noteMetadata.current.title)
    } else if (noteMetadata.current?.opengraph && noteMetadata.current?.opengraph.get('title') && noteMetadata.current?.opengraph.get('title') !== '') {
      setDocumentTitle(noteMetadata.current.opengraph.get('title') ?? untitledNote)
    } else {
      setDocumentTitle(firstHeading.current ?? untitledNote)
    }
  }, [untitledNote])

  const onFirstHeadingChange = useCallback((newFirstHeading: string | undefined) => {
    firstHeading.current = newFirstHeading
    updateDocumentTitle()
  }, [updateDocumentTitle])

  const onMetadataChange = useCallback((metaData: YAMLMetaData | undefined) => {
    noteMetadata.current = metaData
    updateDocumentTitle()
  }, [updateDocumentTitle])

  const onTaskCheckedChange = useCallback((lineInMarkdown: number, checked: boolean) => {
    const lines = markdownContent.split('\n')
    const results = TASK_REGEX.exec(lines[lineInMarkdown])
    if (results) {
      const before = results[1]
      const after = results[3]
      lines[lineInMarkdown] = `${before}[${checked ? 'x' : ' '}]${after}`
      setMarkdownContent(lines.join('\n'))
    }
  }, [markdownContent, setMarkdownContent])

  useEffect(() => {
    document.addEventListener('keydown', shortcutHandler, false)
    return () => {
      document.removeEventListener('keydown', shortcutHandler, false)
    }
  }, [])

  useEffect(() => {
    setFirstDraw(false)
  }, [])

  useEffect(() => {
    if (!firstDraw && !isWide && editorMode === EditorMode.BOTH) {
      setEditorMode(EditorMode.PREVIEW)
    }
  }, [editorMode, firstDraw, isWide])

  const onMarkdownRendererScroll = useCallback((newScrollState: ScrollState) => {
    if (scrollSource.current === ScrollSource.RENDERER && editorSyncScroll) {
      setScrollState((old) => ({ editorScrollState: newScrollState, rendererScrollState: old.rendererScrollState }))
    }
  }, [editorSyncScroll])

  const onEditorScroll = useCallback((newScrollState: ScrollState) => {
    if (scrollSource.current === ScrollSource.EDITOR && editorSyncScroll) {
      setScrollState((old) => ({ rendererScrollState: newScrollState, editorScrollState: old.editorScrollState }))
    }
  }, [editorSyncScroll])

  return (
    <Fragment>
      <MotdBanner/>
      <DocumentTitle title={documentTitle}/>
      <div className={'d-flex flex-column vh-100'}>
        <AppBar/>
        <DocumentBar title={documentTitle} noteContent={markdownContent}/>
        <Splitter
          showLeft={editorMode === EditorMode.EDITOR || editorMode === EditorMode.BOTH}
          left={
            <EditorPane
              onContentChange={content => setMarkdownContent(content)}
              content={markdownContent}
              scrollState={scrollState.editorScrollState}
              onScroll={onEditorScroll}
              onMakeScrollSource={() => (scrollSource.current = ScrollSource.EDITOR)}
            />
          }
          showRight={editorMode === EditorMode.PREVIEW || (editorMode === EditorMode.BOTH)}
          right={
            <DocumentRenderPane
              content={markdownContent}
              onFirstHeadingChange={onFirstHeadingChange}
              onMakeScrollSource={() => { scrollSource.current = ScrollSource.RENDERER }}
              onMetadataChange={onMetadataChange}
              onScroll={onMarkdownRendererScroll}
              onTaskCheckedChange={onTaskCheckedChange}
              scrollState={scrollState.rendererScrollState}
              wide={editorMode === EditorMode.PREVIEW}
            />
          }
          containerClassName={'overflow-hidden'}/>
      </div>
    </Fragment>
  )
}
