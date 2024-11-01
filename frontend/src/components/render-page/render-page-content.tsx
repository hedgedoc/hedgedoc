/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setDarkModePreference } from '../../redux/dark-mode/methods'
import { useRendererToEditorCommunicator } from '../editor-page/render-context/renderer-to-editor-communicator-context-provider'
import type { ScrollState } from '../editor-page/synced-scroll/scroll-props'
import { eventEmitterContext } from '../markdown-renderer/hooks/use-extension-event-emitter'
import { DocumentMarkdownRenderer } from './renderers/document/document-markdown-renderer'
import { SimpleMarkdownRenderer } from './renderers/simple/simple-markdown-renderer'
import { SlideshowMarkdownRenderer } from './renderers/slideshow/slideshow-markdown-renderer'
import { useRendererReceiveHandler } from './window-post-message-communicator/hooks/use-renderer-receive-handler'
import type { BaseConfiguration } from './window-post-message-communicator/rendering-message'
import { CommunicationMessageType, RendererType } from './window-post-message-communicator/rendering-message'
import { countWords } from './word-counter'
import type { SlideOptions } from '@hedgedoc/commons'
import { EventEmitter2 } from 'eventemitter2'
import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { setPrintMode } from '../../redux/print-mode/methods'
import { usePrintKeyboardShortcut } from '../editor-page/hooks/use-print-keyboard-shortcut'

/**
 * Wraps the markdown rendering in an iframe.
 */
export const RenderPageContent: React.FC = () => {
  const [wantedMarkdownContentLines, setWantedMarkdownContentLines] = useState<string[]>([])
  const deferredMarkdownContentLines = useDeferredValue(wantedMarkdownContentLines)

  const [scrollState, setScrollState] = useState<ScrollState>({ firstLineInView: 1, scrolledPercentage: 0 })
  const [baseConfiguration, setBaseConfiguration] = useState<BaseConfiguration | undefined>(undefined)
  const communicator = useRendererToEditorCommunicator()
  const sendScrolling = useRef<boolean>(false)
  const [newLinesAreBreaks, setNewLinesAreBreaks] = useState<boolean>(true)
  const [slideOptions, setSlideOptions] = useState<SlideOptions>()

  useRendererReceiveHandler(
    CommunicationMessageType.SET_SLIDE_OPTIONS,
    useCallback((values) => setSlideOptions(values.slideOptions), [])
  )

  useRendererReceiveHandler(
    CommunicationMessageType.DISABLE_RENDERER_SCROLL_SOURCE,
    useCallback(() => {
      sendScrolling.current = false
    }, [])
  )

  useRendererReceiveHandler(
    CommunicationMessageType.SET_BASE_CONFIGURATION,
    useCallback((values) => setBaseConfiguration(values.baseConfiguration), [])
  )

  useRendererReceiveHandler(
    CommunicationMessageType.SET_MARKDOWN_CONTENT,
    useCallback((values) => setWantedMarkdownContentLines(values.content), [])
  )

  useRendererReceiveHandler(
    CommunicationMessageType.SET_ADDITIONAL_CONFIGURATION,
    useCallback((values) => {
      setNewLinesAreBreaks(values.newLinesAreBreaks)
      setDarkModePreference(values.darkModePreference)
    }, [])
  )

  useRendererReceiveHandler(
    CommunicationMessageType.SET_SCROLL_STATE,
    useCallback((values) => setScrollState(values.scrollState), [])
  )

  useRendererReceiveHandler(
    CommunicationMessageType.GET_WORD_COUNT,
    useCallback(() => {
      const documentContainer = document.querySelector('[data-word-count-target]')
      communicator.sendMessageToOtherSide({
        type: CommunicationMessageType.ON_WORD_COUNT_CALCULATED,
        words: documentContainer ? countWords(documentContainer) : 0
      })
    }, [communicator])
  )

  useRendererReceiveHandler(
    CommunicationMessageType.SET_PRINT_MODE,
    useCallback(({ printMode }) => {
      setPrintMode(printMode)
    }, [])
  )

  usePrintKeyboardShortcut()

  const onMakeScrollSource = useCallback(() => {
    sendScrolling.current = true
    communicator.sendMessageToOtherSide({
      type: CommunicationMessageType.ENABLE_RENDERER_SCROLL_SOURCE
    })
  }, [communicator])

  const onScroll = useCallback(
    (scrollState: ScrollState) => {
      if (!sendScrolling.current) {
        return
      }
      communicator.sendMessageToOtherSide({
        type: CommunicationMessageType.SET_SCROLL_STATE,
        scrollState
      })
    },
    [communicator]
  )

  const onHeightChange = useCallback(
    (height: number) => {
      communicator.sendMessageToOtherSide({
        type: CommunicationMessageType.ON_HEIGHT_CHANGE,
        height
      })
    },
    [communicator]
  )

  const renderer = useMemo(() => {
    if (!baseConfiguration) {
      return (
        <span>
          This is the render endpoint. If you can read this text then please check your HedgeDoc configuration.
        </span>
      )
    }

    switch (baseConfiguration.rendererType) {
      case RendererType.DOCUMENT:
        return (
          <DocumentMarkdownRenderer
            markdownContentLines={deferredMarkdownContentLines}
            onMakeScrollSource={onMakeScrollSource}
            scrollState={scrollState}
            onScroll={onScroll}
            baseUrl={baseConfiguration.baseUrl}
            onHeightChange={onHeightChange}
            newLinesAreBreaks={newLinesAreBreaks}
          />
        )
      case RendererType.SLIDESHOW:
        return (
          <SlideshowMarkdownRenderer
            markdownContentLines={deferredMarkdownContentLines}
            baseUrl={baseConfiguration.baseUrl}
            newLinesAreBreaks={newLinesAreBreaks}
            slideOptions={slideOptions}
          />
        )
      case RendererType.SIMPLE:
        return (
          <SimpleMarkdownRenderer
            markdownContentLines={deferredMarkdownContentLines}
            baseUrl={baseConfiguration.baseUrl}
            newLinesAreBreaks={newLinesAreBreaks}
            onHeightChange={onHeightChange}
          />
        )
      default:
        return null
    }
  }, [
    baseConfiguration,
    deferredMarkdownContentLines,
    newLinesAreBreaks,
    onHeightChange,
    onMakeScrollSource,
    onScroll,
    scrollState,
    slideOptions
  ])

  const extensionEventEmitter = useMemo(() => new EventEmitter2({ wildcard: true }), [])

  useEffect(() => {
    extensionEventEmitter.onAny((event: string, values: unknown) => {
      communicator.sendMessageToOtherSide({
        type: CommunicationMessageType.EXTENSION_EVENT,
        eventName: event,
        payload: values
      })
    })
  }, [communicator, extensionEventEmitter])

  return <eventEmitterContext.Provider value={extensionEventEmitter}>{renderer}</eventEmitterContext.Provider>
}
