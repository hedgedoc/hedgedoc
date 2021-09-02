/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import equal from 'fast-deep-equal'
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { useIsDarkModeActivated } from '../../../hooks/common/use-is-dark-mode-activated'
import { isTestMode } from '../../../utils/test-modes'
import { RendererProps } from '../../render-page/markdown-document'
import { ImageDetails, RendererType } from '../../render-page/rendering-message'
import { useIFrameEditorToRendererCommunicator } from '../render-context/iframe-editor-to-renderer-communicator-context-provider'
import { ScrollState } from '../synced-scroll/scroll-props'
import { useOnIframeLoad } from './hooks/use-on-iframe-load'
import { ShowOnPropChangeImageLightbox } from './show-on-prop-change-image-lightbox'
import { setRendererStatus } from '../../../redux/renderer-status/methods'

export interface RenderIframeProps extends RendererProps {
  rendererType: RendererType
  forcedDarkMode?: boolean
  frameClasses?: string
}

export const RenderIframe: React.FC<RenderIframeProps> = ({
  markdownContent,
  onTaskCheckedChange,
  scrollState,
  onFirstHeadingChange,
  onScroll,
  onMakeScrollSource,
  frameClasses,
  rendererType,
  forcedDarkMode
}) => {
  const savedDarkMode = useIsDarkModeActivated()
  const darkMode = forcedDarkMode ?? savedDarkMode
  const [lightboxDetails, setLightboxDetails] = useState<ImageDetails | undefined>(undefined)

  const frameReference = useRef<HTMLIFrameElement>(null)
  const frontmatterInfo = useApplicationState((state) => state.noteDetails.frontmatterRendererInfo)
  const rendererOrigin = useApplicationState((state) => state.config.iframeCommunication.rendererOrigin)
  const renderPageUrl = `${rendererOrigin}render`
  const resetRendererReady = useCallback(() => setRendererStatus(false), [])
  const iframeCommunicator = useIFrameEditorToRendererCommunicator()
  const onIframeLoad = useOnIframeLoad(
    frameReference,
    iframeCommunicator,
    rendererOrigin,
    renderPageUrl,
    resetRendererReady
  )
  const [frameHeight, setFrameHeight] = useState<number>(0)

  const rendererReady = useApplicationState((state) => state.rendererStatus.rendererReady)

  useEffect(
    () => () => {
      iframeCommunicator.unregisterEventListener()
      setRendererStatus(false)
    },
    [iframeCommunicator]
  )

  useEffect(() => {
    iframeCommunicator.onFirstHeadingChange(onFirstHeadingChange)
    return () => iframeCommunicator.onFirstHeadingChange(undefined)
  }, [iframeCommunicator, onFirstHeadingChange])

  useEffect(() => {
    iframeCommunicator.onSetScrollState(onScroll)
    return () => iframeCommunicator.onSetScrollState(undefined)
  }, [iframeCommunicator, onScroll])

  useEffect(() => {
    iframeCommunicator.onSetScrollSourceToRenderer(onMakeScrollSource)
    return () => iframeCommunicator.onSetScrollSourceToRenderer(undefined)
  }, [iframeCommunicator, onMakeScrollSource])

  useEffect(() => {
    iframeCommunicator.onTaskCheckboxChange(onTaskCheckedChange)
    return () => iframeCommunicator.onTaskCheckboxChange(undefined)
  }, [iframeCommunicator, onTaskCheckedChange])

  useEffect(() => {
    iframeCommunicator.onImageClicked(setLightboxDetails)
    return () => iframeCommunicator.onImageClicked(undefined)
  }, [iframeCommunicator])

  useEffect(() => {
    iframeCommunicator.onHeightChange(setFrameHeight)
    return () => iframeCommunicator.onHeightChange(undefined)
  }, [iframeCommunicator])

  useEffect(() => {
    iframeCommunicator.onRendererReady(() => {
      iframeCommunicator.sendSetBaseConfiguration({
        baseUrl: window.location.toString(),
        rendererType
      })
      setRendererStatus(true)
    })
    return () => iframeCommunicator.onRendererReady(undefined)
  }, [iframeCommunicator, rendererType])

  useEffect(() => {
    if (rendererReady) {
      iframeCommunicator.sendSetDarkmode(darkMode)
    }
  }, [darkMode, iframeCommunicator, rendererReady])

  const oldScrollState = useRef<ScrollState | undefined>(undefined)
  useEffect(() => {
    if (rendererReady && !equal(scrollState, oldScrollState.current)) {
      oldScrollState.current = scrollState
      iframeCommunicator.sendScrollState(scrollState)
    }
  }, [iframeCommunicator, rendererReady, scrollState])

  useEffect(() => {
    if (rendererReady) {
      iframeCommunicator.sendSetMarkdownContent(markdownContent)
    }
  }, [iframeCommunicator, markdownContent, rendererReady])

  useEffect(() => {
    if (rendererReady && frontmatterInfo !== undefined) {
      iframeCommunicator.sendSetFrontmatterInfo(frontmatterInfo)
    }
  }, [iframeCommunicator, rendererReady, frontmatterInfo])

  return (
    <Fragment>
      <ShowOnPropChangeImageLightbox details={lightboxDetails} />
      <iframe
        style={{ height: `${frameHeight}px` }}
        data-cy={'documentIframe'}
        onLoad={onIframeLoad}
        title='render'
        src={renderPageUrl}
        {...(isTestMode() ? {} : { sandbox: 'allow-downloads allow-same-origin allow-scripts allow-popups' })}
        ref={frameReference}
        className={`border-0 ${frameClasses ?? ''}`}
        data-content-ready={rendererReady}
      />
    </Fragment>
  )
}
