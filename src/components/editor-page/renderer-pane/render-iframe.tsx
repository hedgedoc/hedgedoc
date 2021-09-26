/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { isTestMode } from '../../../utils/test-modes'
import { RendererProps } from '../../render-page/markdown-document'
import {
  CommunicationMessageType,
  OnFirstHeadingChangeMessage,
  OnHeightChangeMessage,
  OnTaskCheckboxChangeMessage,
  RendererType,
  SetScrollStateMessage
} from '../../render-page/window-post-message-communicator/rendering-message'
import { useEditorToRendererCommunicator } from '../render-context/editor-to-renderer-communicator-context-provider'
import { useOnIframeLoad } from './hooks/use-on-iframe-load'
import { CommunicatorImageLightbox } from './communicator-image-lightbox'
import { setRendererStatus } from '../../../redux/renderer-status/methods'
import { useEditorReceiveHandler } from '../../render-page/window-post-message-communicator/hooks/use-editor-receive-handler'
import { useIsRendererReady } from '../../render-page/window-post-message-communicator/hooks/use-is-renderer-ready'
import { useSendDarkModeStatusToRenderer } from './hooks/use-send-dark-mode-status-to-renderer'
import { useSendMarkdownToRenderer } from './hooks/use-send-markdown-to-renderer'
import { useSendScrollState } from './hooks/use-send-scroll-state'

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
  const frameReference = useRef<HTMLIFrameElement>(null)
  const rendererOrigin = useApplicationState((state) => state.config.iframeCommunication.rendererOrigin)
  const renderPageUrl = `${rendererOrigin}render`
  const resetRendererReady = useCallback(() => setRendererStatus(false), [])
  const iframeCommunicator = useEditorToRendererCommunicator()
  const rendererReady = useIsRendererReady()
  const onIframeLoad = useOnIframeLoad(
    frameReference,
    iframeCommunicator,
    rendererOrigin,
    renderPageUrl,
    resetRendererReady
  )
  const [frameHeight, setFrameHeight] = useState<number>(0)

  useEffect(
    () => () => {
      iframeCommunicator.unregisterEventListener()
      setRendererStatus(false)
    },
    [iframeCommunicator]
  )

  useEditorReceiveHandler(
    CommunicationMessageType.ON_FIRST_HEADING_CHANGE,
    useCallback(
      (values: OnFirstHeadingChangeMessage) => onFirstHeadingChange?.(values.firstHeading),
      [onFirstHeadingChange]
    )
  )

  useEditorReceiveHandler(
    CommunicationMessageType.SET_SCROLL_STATE,
    useCallback((values: SetScrollStateMessage) => onScroll?.(values.scrollState), [onScroll])
  )

  useEditorReceiveHandler(
    CommunicationMessageType.SET_SCROLL_SOURCE_TO_RENDERER,
    useCallback(() => onMakeScrollSource?.(), [onMakeScrollSource])
  )

  useEditorReceiveHandler(
    CommunicationMessageType.ON_TASK_CHECKBOX_CHANGE,
    useCallback(
      (values: OnTaskCheckboxChangeMessage) => onTaskCheckedChange?.(values.lineInMarkdown, values.checked),
      [onTaskCheckedChange]
    )
  )

  useEditorReceiveHandler(
    CommunicationMessageType.ON_HEIGHT_CHANGE,
    useCallback((values: OnHeightChangeMessage) => setFrameHeight?.(values.height), [setFrameHeight])
  )

  useEditorReceiveHandler(
    CommunicationMessageType.RENDERER_READY,
    useCallback(() => {
      iframeCommunicator.enableCommunication()
      iframeCommunicator.sendMessageToOtherSide({
        type: CommunicationMessageType.SET_BASE_CONFIGURATION,
        baseConfiguration: {
          baseUrl: window.location.toString(),
          rendererType
        }
      })
      setRendererStatus(true)
    }, [iframeCommunicator, rendererType])
  )

  useSendScrollState(scrollState)
  useSendDarkModeStatusToRenderer(forcedDarkMode)
  useSendMarkdownToRenderer(markdownContent)

  return (
    <Fragment>
      <CommunicatorImageLightbox />
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
