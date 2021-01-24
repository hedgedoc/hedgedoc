/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useIsDarkModeActivated } from '../../../hooks/common/use-is-dark-mode-activated'
import { ApplicationState } from '../../../redux'
import { isTestMode } from '../../../utils/is-test-mode'
import { ImageLightboxModal } from '../../markdown-renderer/replace-components/image/image-lightbox-modal'
import { IframeEditorToRendererCommunicator } from '../../render-page/iframe-editor-to-renderer-communicator'
import { ImageDetails } from '../../render-page/rendering-message'
import { ScrollingDocumentRenderPaneProps } from './scrolling-document-render-pane'

export const DocumentIframe: React.FC<ScrollingDocumentRenderPaneProps> = (
  {
    markdownContent,
    onTaskCheckedChange,
    onMetadataChange,
    scrollState,
    onFirstHeadingChange,
    wide,
    onScroll,
    onMakeScrollSource,
    extraClasses
  }) => {
  const frameReference = useRef<HTMLIFrameElement>(null)
  const darkMode = useIsDarkModeActivated()
  const [lightboxDetails, setLightboxDetails] = useState<ImageDetails | undefined>(undefined)

  const rendererOrigin = useSelector((state: ApplicationState) => state.config.iframeCommunication.rendererOrigin)
  const renderPageUrl = `${rendererOrigin}/render`
  const iframeCommunicator = useMemo(() => new IframeEditorToRendererCommunicator(), [])
  useEffect(() => () => iframeCommunicator.unregisterEventListener(), [iframeCommunicator])

  const [rendererReady, setRendererReady] = useState<boolean>(false)

  useEffect(() => iframeCommunicator.onFirstHeadingChange(onFirstHeadingChange), [iframeCommunicator, onFirstHeadingChange])
  useEffect(() => iframeCommunicator.onMetaDataChange(onMetadataChange), [iframeCommunicator, onMetadataChange])
  useEffect(() => iframeCommunicator.onSetScrollState(onScroll), [iframeCommunicator, onScroll])
  useEffect(() => iframeCommunicator.onSetScrollSourceToRenderer(onMakeScrollSource), [iframeCommunicator, onMakeScrollSource])
  useEffect(() => iframeCommunicator.onTaskCheckboxChange(onTaskCheckedChange), [iframeCommunicator, onTaskCheckedChange])
  useEffect(() => iframeCommunicator.onImageClicked(setLightboxDetails), [iframeCommunicator])
  useEffect(() => iframeCommunicator.onRendererReady(() => setRendererReady(true)), [darkMode, iframeCommunicator, scrollState, wide])

  useEffect(() => {
    if (rendererReady) {
      iframeCommunicator.sendSetMarkdownContent(markdownContent)
    }
  }, [iframeCommunicator, markdownContent, rendererReady])
  useEffect(() => {
    if (rendererReady) {
      iframeCommunicator.sendSetDarkmode(darkMode)
    }
  }, [darkMode, iframeCommunicator, rendererReady])
  useEffect(() => {
    if (rendererReady) {
      iframeCommunicator.sendScrollState(scrollState)
    }
  }, [iframeCommunicator, rendererReady, scrollState])
  useEffect(() => {
    if (rendererReady) {
      iframeCommunicator.sendSetWide(wide ?? false)
    }
  }, [iframeCommunicator, rendererReady, wide])

  useEffect(() => {
    if (rendererReady) {
      iframeCommunicator.sendSetBaseUrl(window.location.toString())
    }
  }, [iframeCommunicator, rendererReady,])

  const sendToRenderPage = useRef<boolean>(true)

  const onLoad = useCallback(() => {
    const frame = frameReference.current
    if (!frame || !frame.contentWindow) {
      iframeCommunicator.unsetOtherSide()
      return
    }

    if (sendToRenderPage.current) {
      iframeCommunicator.setOtherSide(frame.contentWindow, rendererOrigin)
      sendToRenderPage.current = false
      return
    } else {
      setRendererReady(false)
      console.error("Navigated away from unknown URL")
      frame.src = renderPageUrl
      sendToRenderPage.current = true
    }
  }, [iframeCommunicator, renderPageUrl, rendererOrigin])

  const hideLightbox = useCallback(() => {
    setLightboxDetails(undefined)
  }, [])

  return <Fragment>
    <ImageLightboxModal show={!!lightboxDetails} onHide={hideLightbox} src={lightboxDetails?.src}
                        alt={lightboxDetails?.alt} title={lightboxDetails?.title}/>
    <iframe data-cy={'documentIframe'} onLoad={onLoad} title="render" src={renderPageUrl}
            {...isTestMode() ? {} : { sandbox: 'allow-downloads allow-same-origin allow-scripts allow-popups' }}
            ref={frameReference} className={`h-100 w-100 border-0 ${extraClasses ?? ''}`}/>
  </Fragment>
}
