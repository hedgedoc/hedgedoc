/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApplyDarkMode } from '../../hooks/common/use-apply-dark-mode'
import { useDocumentTitleWithNoteTitle } from '../../hooks/common/use-document-title-with-note-title'
import { useNoteMarkdownContent } from '../../hooks/common/use-note-markdown-content'
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
import { RendererType } from '../render-page/rendering-message'
import { useEditorModeFromUrl } from './hooks/useEditorModeFromUrl'
import { UiNotifications } from '../notifications/ui-notifications'
import { useNotificationTest } from './use-notification-test'
import { IframeEditorToRendererCommunicatorContextProvider } from './render-context/iframe-editor-to-renderer-communicator-context-provider'
import { useUpdateLocalHistoryEntry } from './hooks/useUpdateLocalHistoryEntry'
import { useApplicationState } from '../../hooks/common/use-application-state'

export interface EditorPagePathParams {
  id: string
}

export enum ScrollSource {
  EDITOR,
  RENDERER
}

export const EditorPage: React.FC = () => {
  useTranslation()
  const markdownContent = useNoteMarkdownContent()
  const scrollSource = useRef<ScrollSource>(ScrollSource.EDITOR)

  const editorMode: EditorMode = useApplicationState((state) => state.editorConfig.editorMode)
  const editorSyncScroll: boolean = useApplicationState((state) => state.editorConfig.syncScroll)

  const [scrollState, setScrollState] = useState<DualScrollState>(() => ({
    editorScrollState: { firstLineInView: 1, scrolledPercentage: 0 },
    rendererScrollState: { firstLineInView: 1, scrolledPercentage: 0 }
  }))

  const onMarkdownRendererScroll = useCallback(
    (newScrollState: ScrollState) => {
      if (scrollSource.current === ScrollSource.RENDERER && editorSyncScroll) {
        setScrollState((old) => ({ editorScrollState: newScrollState, rendererScrollState: old.rendererScrollState }))
      }
    },
    [editorSyncScroll]
  )

  const onEditorScroll = useCallback(
    (newScrollState: ScrollState) => {
      if (scrollSource.current === ScrollSource.EDITOR && editorSyncScroll) {
        setScrollState((old) => ({ rendererScrollState: newScrollState, editorScrollState: old.editorScrollState }))
      }
    },
    [editorSyncScroll]
  )

  useViewModeShortcuts()
  useApplyDarkMode()
  useDocumentTitleWithNoteTitle()
  useEditorModeFromUrl()

  const [error, loading] = useLoadNoteFromServer()

  useUpdateLocalHistoryEntry(!error && !loading)

  const setRendererToScrollSource = useCallback(() => {
    scrollSource.current = ScrollSource.RENDERER
  }, [])

  const setEditorToScrollSource = useCallback(() => {
    scrollSource.current = ScrollSource.EDITOR
  }, [])

  useNotificationTest()

  const leftPane = useMemo(
    () => (
      <EditorPane
        onContentChange={setNoteMarkdownContent}
        content={markdownContent}
        scrollState={scrollState.editorScrollState}
        onScroll={onEditorScroll}
        onMakeScrollSource={setEditorToScrollSource}
      />
    ),
    [markdownContent, onEditorScroll, scrollState.editorScrollState, setEditorToScrollSource]
  )

  const rightPane = useMemo(
    () => (
      <RenderIframe
        frameClasses={'h-100 w-100'}
        markdownContent={markdownContent}
        onMakeScrollSource={setRendererToScrollSource}
        onFirstHeadingChange={updateNoteTitleByFirstHeading}
        onTaskCheckedChange={SetCheckboxInMarkdownContent}
        onFrontmatterChange={setNoteFrontmatter}
        onScroll={onMarkdownRendererScroll}
        scrollState={scrollState.rendererScrollState}
        rendererType={RendererType.DOCUMENT}
      />
    ),
    [markdownContent, onMarkdownRendererScroll, scrollState.rendererScrollState, setRendererToScrollSource]
  )

  return (
    <IframeEditorToRendererCommunicatorContextProvider>
      <UiNotifications />
      <MotdBanner />
      <div className={'d-flex flex-column vh-100'}>
        <AppBar mode={AppBarMode.EDITOR} />
        <div className={'container'}>
          <ErrorWhileLoadingNoteAlert show={error} />
          <LoadingNoteAlert show={loading} />
        </div>
        <ShowIf condition={!error && !loading}>
          <div className={'flex-fill d-flex h-100 w-100 overflow-hidden flex-row'}>
            <Splitter
              showLeft={editorMode === EditorMode.EDITOR || editorMode === EditorMode.BOTH}
              left={leftPane}
              showRight={editorMode === EditorMode.PREVIEW || editorMode === EditorMode.BOTH}
              right={rightPane}
              containerClassName={'overflow-hidden'}
            />
            <Sidebar />
          </div>
        </ShowIf>
      </div>
    </IframeEditorToRendererCommunicatorContextProvider>
  )
}

export default EditorPage
