/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { useApplyDarkMode } from '../../hooks/common/use-apply-dark-mode'
import { useDocumentTitleWithNoteTitle } from '../../hooks/common/use-document-title-with-note-title'
import { useNoteMarkdownContent } from '../../hooks/common/use-note-markdown-content'
import { ApplicationState } from '../../redux'
import { setEditorMode } from '../../redux/editor/methods'
import {
  SetCheckboxInMarkdownContent,
  setNoteFrontmatter,
  setNoteMarkdownContent,
  updateNoteTitleByFirstHeading
} from '../../redux/note-details/methods'
import { MotdBanner } from '../common/motd-banner/motd-banner'
import { ShowIf } from '../common/show-if/show-if'
import { ErrorWhileLoadingNoteAlert } from '../document-read-only-page/ErrorWhileLoadingNoteAlert'
import { LoadingNoteAlert } from '../document-read-only-page/LoadingNoteAlert'
import { AppBar, AppBarMode } from './app-bar/app-bar'
import { EditorMode } from './app-bar/editor-view-mode'
import { EditorPane } from './editor-pane/editor-pane'
import { useLoadNoteFromServer } from './hooks/useLoadNoteFromServer'
import { useViewModeShortcuts } from './hooks/useViewModeShortcuts'
import { RenderIframe } from './renderer-pane/render-iframe'
import { Sidebar } from './sidebar/sidebar'
import { Splitter } from './splitter/splitter'
import { DualScrollState, ScrollState } from './synced-scroll/scroll-props'

export interface EditorPagePathParams {
  id: string
}

export enum ScrollSource {
  EDITOR,
  RENDERER
}

export const EditorPage: React.FC = () => {
  useTranslation()
  const { search } = useLocation()
  const markdownContent = useNoteMarkdownContent()
  const scrollSource = useRef<ScrollSource>(ScrollSource.EDITOR)

  const editorMode: EditorMode = useSelector((state: ApplicationState) => state.editorConfig.editorMode)
  const editorSyncScroll: boolean = useSelector((state: ApplicationState) => state.editorConfig.syncScroll)

  const [scrollState, setScrollState] = useState<DualScrollState>(() => ({
    editorScrollState: { firstLineInView: 1, scrolledPercentage: 0 },
    rendererScrollState: { firstLineInView: 1, scrolledPercentage: 0 }
  }))

  useEffect(() => {
    const requestedMode = search.substr(1)
    const mode = Object.values(EditorMode)
                       .find(mode => mode === requestedMode)
    if (mode) {
      setEditorMode(mode)
    }
  }, [search])

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

  useViewModeShortcuts()
  useApplyDarkMode()
  useDocumentTitleWithNoteTitle()
  const [error, loading] = useLoadNoteFromServer()

  const setRendererToScrollSource = useCallback(() => {
    scrollSource.current = ScrollSource.RENDERER
  }, [])

  const setEditorToScrollSource = useCallback(() => {
    scrollSource.current = ScrollSource.EDITOR
  }, [])

  return (
    <Fragment>
      <MotdBanner/>
      <div className={ 'd-flex flex-column vh-100' }>
        <AppBar mode={ AppBarMode.EDITOR }/>

        <div className={ 'container' }>
          <ErrorWhileLoadingNoteAlert show={ error }/>
          <LoadingNoteAlert show={ loading }/>
        </div>
        <ShowIf condition={ !error && !loading }>
          <div className={ 'flex-fill d-flex h-100 w-100 overflow-hidden flex-row' }>
            <Splitter
              showLeft={ editorMode === EditorMode.EDITOR || editorMode === EditorMode.BOTH }
              left={
                <EditorPane
                  onContentChange={ setNoteMarkdownContent }
                  content={ markdownContent }
                  scrollState={ scrollState.editorScrollState }
                  onScroll={ onEditorScroll }
                  onMakeScrollSource={ setEditorToScrollSource }/>
              }
              showRight={ editorMode === EditorMode.PREVIEW || editorMode === EditorMode.BOTH }
              right={
                <RenderIframe
                  markdownContent={ markdownContent }
                  onMakeScrollSource={ setRendererToScrollSource }
                  onFirstHeadingChange={ updateNoteTitleByFirstHeading }
                  onTaskCheckedChange={ SetCheckboxInMarkdownContent }
                  onFrontmatterChange={ setNoteFrontmatter }
                  onScroll={ onMarkdownRendererScroll }
                  scrollState={ scrollState.rendererScrollState }/>
              }
              containerClassName={ 'overflow-hidden' }/>
            <Sidebar/>
          </div>
        </ShowIf>
      </div>
    </Fragment>
  )
}
export default EditorPage
