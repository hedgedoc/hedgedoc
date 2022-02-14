/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApplyDarkMode } from '../../hooks/common/use-apply-dark-mode'
import { setCheckboxInMarkdownContent, updateNoteTitleByFirstHeading } from '../../redux/note-details/methods'
import { MotdModal } from '../common/motd-modal/motd-modal'
import { ShowIf } from '../common/show-if/show-if'
import { ErrorWhileLoadingNoteAlert } from '../document-read-only-page/ErrorWhileLoadingNoteAlert'
import { LoadingNoteAlert } from '../document-read-only-page/LoadingNoteAlert'
import { AppBar, AppBarMode } from './app-bar/app-bar'
import { EditorMode } from './app-bar/editor-view-mode'
import { useLoadNoteFromServer } from './hooks/useLoadNoteFromServer'
import { useViewModeShortcuts } from './hooks/useViewModeShortcuts'
import { Sidebar } from './sidebar/sidebar'
import { Splitter } from './splitter/splitter'
import type { DualScrollState, ScrollState } from './synced-scroll/scroll-props'
import { RendererType } from '../render-page/window-post-message-communicator/rendering-message'
import { useEditorModeFromUrl } from './hooks/useEditorModeFromUrl'
import { UiNotifications } from '../notifications/ui-notifications'
import { useUpdateLocalHistoryEntry } from './hooks/useUpdateLocalHistoryEntry'
import { useApplicationState } from '../../hooks/common/use-application-state'
import { EditorDocumentRenderer } from './editor-document-renderer/editor-document-renderer'
import { Logger } from '../../utils/logger'
import { NoteType } from '../../redux/note-details/types/note-details'
import { NoteAndAppTitleHead } from '../layout/note-and-app-title-head'
import equal from 'fast-deep-equal'
import { EditorPane } from './editor-pane/editor-pane'

export interface EditorPagePathParams {
  id: string
}

export enum ScrollSource {
  EDITOR = 'editor',
  RENDERER = 'renderer'
}

const log = new Logger('EditorPage')

/**
 * This is the content of the actual editor page.
 */
export const EditorPageContent: React.FC = () => {
  useTranslation()
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
        setScrollState((old) => {
          const newState: DualScrollState = {
            editorScrollState: newScrollState,
            rendererScrollState: old.rendererScrollState
          }
          return equal(newState, old) ? old : newState
        })
      }
    },
    [editorSyncScroll]
  )

  useEffect(() => {
    log.debug('New scroll state', scrollState, scrollSource.current)
  }, [scrollState])

  const onEditorScroll = useCallback(
    (newScrollState: ScrollState) => {
      if (scrollSource.current === ScrollSource.EDITOR && editorSyncScroll) {
        setScrollState((old) => {
          const newState: DualScrollState = {
            rendererScrollState: newScrollState,
            editorScrollState: old.editorScrollState
          }
          return equal(newState, old) ? old : newState
        })
      }
    },
    [editorSyncScroll]
  )

  useViewModeShortcuts()
  useApplyDarkMode()
  useEditorModeFromUrl()

  const [error, loading] = useLoadNoteFromServer()

  useUpdateLocalHistoryEntry(!error && !loading)

  const setRendererToScrollSource = useCallback(() => {
    if (scrollSource.current !== ScrollSource.RENDERER) {
      scrollSource.current = ScrollSource.RENDERER
      log.debug('Make renderer scroll source')
    }
  }, [])

  const setEditorToScrollSource = useCallback(() => {
    if (scrollSource.current !== ScrollSource.EDITOR) {
      scrollSource.current = ScrollSource.EDITOR
      log.debug('Make editor scroll source')
    }
  }, [])

  const leftPane = useMemo(
    () => (
      <EditorPane
        scrollState={scrollState.editorScrollState}
        onScroll={onEditorScroll}
        onMakeScrollSource={setEditorToScrollSource}
      />
    ),
    [onEditorScroll, scrollState.editorScrollState, setEditorToScrollSource]
  )
  const noteType: NoteType = useApplicationState((state) => state.noteDetails.frontmatter.type)

  const rightPane = useMemo(
    () => (
      <EditorDocumentRenderer
        frameClasses={'h-100 w-100'}
        onMakeScrollSource={setRendererToScrollSource}
        onFirstHeadingChange={updateNoteTitleByFirstHeading}
        onTaskCheckedChange={setCheckboxInMarkdownContent}
        onScroll={onMarkdownRendererScroll}
        scrollState={scrollState.rendererScrollState}
        rendererType={noteType === NoteType.SLIDE ? RendererType.SLIDESHOW : RendererType.DOCUMENT}
      />
    ),
    [noteType, onMarkdownRendererScroll, scrollState.rendererScrollState, setRendererToScrollSource]
  )

  return (
    <Fragment>
      <NoteAndAppTitleHead />
      <UiNotifications />
      <MotdModal />
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
              additionalContainerClassName={'overflow-hidden'}
            />
            <Sidebar />
          </div>
        </ShowIf>
      </div>
    </Fragment>
  )
}
