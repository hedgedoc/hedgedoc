/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { DarkModePreference } from '../../../redux/dark-mode/types'
import { concatCssClasses } from '../../../utils/concat-css-classes'
import { cypressAttribute, cypressId } from '../../../utils/cypress-attribute'
import { Logger } from '../../../utils/logger'
import { isTestMode } from '../../../utils/test-modes'
import { useEditorToRendererCommunicator } from '../../editor-page/render-context/editor-to-renderer-communicator-context-provider'
import type { ScrollProps } from '../../editor-page/synced-scroll/scroll-props'
import { useExtensionEventEmitter } from '../../markdown-renderer/hooks/use-extension-event-emitter'
import type { CommonMarkdownRendererProps } from '../../render-page/renderers/common-markdown-renderer-props'
import { useEditorReceiveHandler } from '../../render-page/window-post-message-communicator/hooks/use-editor-receive-handler'
import type {
  ExtensionEvent,
  OnHeightChangeMessage,
  SetScrollStateMessage
} from '../../render-page/window-post-message-communicator/rendering-message'
import type { RendererType } from '../../render-page/window-post-message-communicator/rendering-message'
import { CommunicationMessageType } from '../../render-page/window-post-message-communicator/rendering-message'
import { ShowIf } from '../show-if/show-if'
import { WaitSpinner } from '../wait-spinner/wait-spinner'
import { useEffectOnRenderTypeChange } from './hooks/use-effect-on-render-type-change'
import { useForceRenderPageUrlOnIframeLoadCallback } from './hooks/use-force-render-page-url-on-iframe-load-callback'
import { useSendAdditionalConfigurationToRenderer } from './hooks/use-send-additional-configuration-to-renderer'
import { useSendMarkdownToRenderer } from './hooks/use-send-markdown-to-renderer'
import { useSendScrollState } from './hooks/use-send-scroll-state'
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface RendererIframeProps extends Omit<CommonMarkdownRendererProps & ScrollProps, 'baseUrl'> {
  rendererType: RendererType
  forcedDarkMode?: DarkModePreference
  frameClasses?: string
  onRendererStatusChange?: undefined | ((rendererReady: boolean) => void)
  adaptFrameHeightToContent?: boolean
}

const log = new Logger('RendererIframe')

/**
 * Renders the iframe for the HTML-rendering of the markdown content.
 * The iframe is enhanced by the {@link useEditorToRendererCommunicator iframe communicator} which is used for
 * passing data from the parent frame into the iframe as well as receiving status messages and data from the iframe.
 *
 * @param markdownContentLines Array of lines of the markdown content
 * @param onTaskCheckedChange Callback that is fired when a task-list item in the iframe is checked
 * @param scrollState The current {@link ScrollState}
 * @param onScroll Callback that is fired when the user scrolls in the iframe
 * @param onMakeScrollSource Callback that is fired when the renderer requests to be set as the current scroll source
 * @param frameClasses CSS classes that should be applied to the iframe
 * @param rendererType The {@link RendererType type} of the renderer to use.
 * @param forcedDarkMode If set, the dark mode will be set to the given value. Otherwise, the dark mode won't be changed.
 * @param adaptFrameHeightToContent If set, the iframe height will be adjusted to the content height
 * @param onRendererStatusChange Callback that is fired when the renderer in the iframe is ready
 */
export const RendererIframe: React.FC<RendererIframeProps> = ({
  markdownContentLines,
  scrollState,
  onScroll,
  onMakeScrollSource,
  frameClasses,
  rendererType,
  forcedDarkMode,
  adaptFrameHeightToContent,
  onRendererStatusChange
}) => {
  const [rendererReady, setRendererReady] = useState<boolean>(false)
  const frameReference = useRef<HTMLIFrameElement>(null)
  const iframeCommunicator = useEditorToRendererCommunicator()
  const resetRendererReady = useCallback(() => {
    log.debug('Reset render status')
    setRendererReady(false)
  }, [])
  const onIframeLoad = useForceRenderPageUrlOnIframeLoadCallback(frameReference, resetRendererReady)
  const [frameHeight, setFrameHeight] = useState<number>(0)

  useEffect(() => {
    onRendererStatusChange?.(rendererReady)
  }, [onRendererStatusChange, rendererReady])

  useEffect(() => () => setRendererReady(false), [iframeCommunicator])

  useEffect(() => {
    if (!rendererReady) {
      iframeCommunicator.unsetMessageTarget()
    }
  }, [iframeCommunicator, rendererReady])

  useEffect(() => {
    onRendererStatusChange?.(rendererReady)
  }, [onRendererStatusChange, rendererReady])

  const eventEmitter = useExtensionEventEmitter()

  useEditorReceiveHandler(
    CommunicationMessageType.EXTENSION_EVENT,
    useMemo(() => {
      return eventEmitter === undefined
        ? undefined
        : (values: ExtensionEvent) => eventEmitter.emit(values.eventName, values.payload)
    }, [eventEmitter])
  )

  useEditorReceiveHandler(
    CommunicationMessageType.ON_HEIGHT_CHANGE,
    useCallback(
      (values: OnHeightChangeMessage) => {
        if (adaptFrameHeightToContent) {
          setFrameHeight?.(values.height)
        }
      },
      [adaptFrameHeightToContent]
    )
  )

  useEditorReceiveHandler(
    CommunicationMessageType.RENDERER_READY,
    useCallback(() => {
      const frame = frameReference.current
      if (!frame) {
        log.error('Load triggered without frame in ref')
        return
      }
      const otherWindow = frame.contentWindow
      if (!otherWindow) {
        log.error('Load triggered without content window')
        return
      }
      iframeCommunicator.setMessageTarget(otherWindow)
      iframeCommunicator.enableCommunication()
      iframeCommunicator.sendMessageToOtherSide({
        type: CommunicationMessageType.SET_BASE_CONFIGURATION,
        baseConfiguration: {
          baseUrl: window.location.toString(),
          rendererType
        }
      })
      setRendererReady(true)
    }, [iframeCommunicator, rendererType])
  )

  useEffectOnRenderTypeChange(rendererType, onIframeLoad)
  useSendAdditionalConfigurationToRenderer(rendererReady, forcedDarkMode)
  useSendMarkdownToRenderer(markdownContentLines, rendererReady)

  useSendScrollState(scrollState, rendererReady)
  useEditorReceiveHandler(
    CommunicationMessageType.SET_SCROLL_STATE,
    useCallback((values: SetScrollStateMessage) => onScroll?.(values.scrollState), [onScroll])
  )
  useEditorReceiveHandler(
    CommunicationMessageType.ENABLE_RENDERER_SCROLL_SOURCE,
    useCallback(() => onMakeScrollSource?.(), [onMakeScrollSource])
  )

  return (
    <Fragment>
      <ShowIf condition={!rendererReady}>
        <WaitSpinner />
      </ShowIf>
      <iframe
        style={{ height: `${frameHeight}px` }}
        {...cypressId('documentIframe')}
        onLoad={onIframeLoad}
        title='render'
        {...(isTestMode ? {} : { sandbox: 'allow-downloads allow-same-origin allow-scripts allow-popups' })}
        allowFullScreen={true}
        ref={frameReference}
        referrerPolicy={'no-referrer'}
        className={concatCssClasses('border-0', frameClasses)}
        allow={'clipboard-write'}
        {...cypressAttribute('renderer-ready', rendererReady ? 'true' : 'false')}
        {...cypressAttribute('renderer-type', rendererType)}
      />
    </Fragment>
  )
}
