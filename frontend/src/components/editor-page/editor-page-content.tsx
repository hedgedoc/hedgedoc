/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../hooks/common/use-application-state'
import { useApplyDarkMode } from '../../hooks/common/use-apply-dark-mode'
import { updateNoteTitleByFirstHeading } from '../../redux/note-details/methods'
import { Logger } from '../../utils/logger'
import { MotdModal } from '../common/motd-modal/motd-modal'
import { CommunicatorImageLightbox } from '../markdown-renderer/extensions/image/communicator-image-lightbox'
import { ExtensionEventEmitterProvider } from '../markdown-renderer/hooks/use-extension-event-emitter'
import { AppBar, AppBarMode } from './app-bar/app-bar'
import { ChangeEditorContentContextProvider } from './change-content-context/codemirror-reference-context'
import { EditorDocumentRenderer } from './editor-document-renderer/editor-document-renderer'
import { EditorPane } from './editor-pane/editor-pane'
import { useComponentsFromAppExtensions } from './editor-pane/hooks/use-components-from-app-extensions'
import { HeadMetaProperties } from './head-meta-properties/head-meta-properties'
import { useUpdateLocalHistoryEntry } from './hooks/use-update-local-history-entry'
import { Sidebar } from './sidebar/sidebar'
import { Splitter } from './splitter/splitter'
import type { DualScrollState, ScrollState } from './synced-scroll/scroll-props'
import { RealtimeConnectionModal } from './websocket-connection-modal/realtime-connection-modal'
import equal from 'fast-deep-equal'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

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

  useApplyDarkMode()
  useUpdateLocalHistoryEntry()

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

  const rightPane = useMemo(
    () => (
      <EditorDocumentRenderer
        frameClasses={'h-100 w-100'}
        onMakeScrollSource={setRendererToScrollSource}
        onFirstHeadingChange={updateNoteTitleByFirstHeading}
        onScroll={onMarkdownRendererScroll}
        scrollState={scrollState.rendererScrollState}
      />
    ),
    [onMarkdownRendererScroll, scrollState.rendererScrollState, setRendererToScrollSource]
  )

  const editorExtensionComponents = useComponentsFromAppExtensions()

  return (
    <ChangeEditorContentContextProvider>
      <ExtensionEventEmitterProvider>
        {editorExtensionComponents}
        <CommunicatorImageLightbox />
        <HeadMetaProperties />
        <MotdModal />
        <RealtimeConnectionModal />
        <div className={'d-flex flex-column vh-100'}>
          <AppBar mode={AppBarMode.EDITOR} />
          <div className={'flex-fill d-flex h-100 w-100 overflow-hidden flex-row'}>
            <Splitter
              left={leftPane}
              right={rightPane}
              additionalContainerClassName={'overflow-hidden position-relative'}
            />
            <Sidebar />
          </div>
        </div>
      </ExtensionEventEmitterProvider>
    </ChangeEditorContentContextProvider>
  )
}
