/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import equal from 'fast-deep-equal'
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useIsDarkModeActivated } from '../../../hooks/common/use-is-dark-mode-activated'
import { ApplicationState } from '../../../redux'
import { isTestMode } from '../../../utils/is-test-mode'
import { RendererProps } from '../../render-page/markdown-document'
import { ImageDetails, RendererType } from '../../render-page/rendering-message'
import { useContextOrStandaloneIframeCommunicator } from '../render-context/iframe-communicator-context-provider'
import { ScrollState } from '../synced-scroll/scroll-props'
import { useOnIframeLoad } from './hooks/use-on-iframe-load'
import { ShowOnPropChangeImageLightbox } from './show-on-prop-change-image-lightbox'

export interface RenderIframeProps extends RendererProps {
  onRendererReadyChange?: (rendererReady: boolean) => void
  rendererType: RendererType,
  forcedDarkMode?: boolean
  frameClasses?: string
}

export const RenderIframe: React.FC<RenderIframeProps> = (
  {
    markdownContent,
    onTaskCheckedChange,
    onFrontmatterChange,
    scrollState,
    onFirstHeadingChange,
    onScroll,
    onMakeScrollSource,
    frameClasses,
    onRendererReadyChange,
    rendererType,
    forcedDarkMode
  }) => {
  const savedDarkMode = useIsDarkModeActivated()
  const darkMode = forcedDarkMode ?? savedDarkMode
  const [rendererReady, setRendererReady] = useState<boolean>(false)
  const [lightboxDetails, setLightboxDetails] = useState<ImageDetails | undefined>(undefined)

  const frameReference = useRef<HTMLIFrameElement>(null)
  const rendererOrigin = useSelector((state: ApplicationState) => state.config.iframeCommunication.rendererOrigin)
  const renderPageUrl = `${ rendererOrigin }/render`
  const resetRendererReady = useCallback(() => setRendererReady(false), [])
  const iframeCommunicator = useContextOrStandaloneIframeCommunicator()
  const onIframeLoad = useOnIframeLoad(frameReference, iframeCommunicator, rendererOrigin, renderPageUrl, resetRendererReady)
  const [frameHeight, setFrameHeight] = useState<number>(0)

  useEffect(() => {
    onRendererReadyChange?.(rendererReady)
  }, [onRendererReadyChange, rendererReady])

  useEffect(() => () => iframeCommunicator.unregisterEventListener(), [iframeCommunicator])
  useEffect(() => iframeCommunicator.onFirstHeadingChange(onFirstHeadingChange), [iframeCommunicator,
    onFirstHeadingChange])
  useEffect(() => iframeCommunicator.onFrontmatterChange(onFrontmatterChange), [iframeCommunicator,
    onFrontmatterChange])
  useEffect(() => iframeCommunicator.onSetScrollState(onScroll), [iframeCommunicator, onScroll])
  useEffect(() => iframeCommunicator.onSetScrollSourceToRenderer(onMakeScrollSource), [iframeCommunicator,
    onMakeScrollSource])
  useEffect(() => iframeCommunicator.onTaskCheckboxChange(onTaskCheckedChange), [iframeCommunicator,
    onTaskCheckedChange])
  useEffect(() => iframeCommunicator.onImageClicked(setLightboxDetails), [iframeCommunicator])
  useEffect(() => iframeCommunicator.onRendererReady(() => {
    iframeCommunicator.sendSetBaseConfiguration({
      baseUrl: window.location.toString(),
      rendererType
    })
    setRendererReady(true)
  }), [darkMode, rendererType, iframeCommunicator, rendererReady, scrollState])
  useEffect(() => iframeCommunicator.onHeightChange(setFrameHeight), [iframeCommunicator])

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

  return <Fragment>
    <ShowOnPropChangeImageLightbox details={ lightboxDetails }/>
    <iframe style={ { height: `${ frameHeight }px` } } data-cy={ 'documentIframe' } onLoad={ onIframeLoad }
            title="render" src={ renderPageUrl }
            { ...isTestMode() ? {} : { sandbox: 'allow-downloads allow-same-origin allow-scripts allow-popups' } }
            ref={ frameReference } className={ `border-0 ${ frameClasses ?? '' }` }/>
  </Fragment>
}
