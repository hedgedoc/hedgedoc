/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useRef, useState } from 'react'
import type { ScrollState } from '../editor-page/synced-scroll/scroll-props'
import type { BaseConfiguration } from './window-post-message-communicator/rendering-message'
import { CommunicationMessageType, RendererType } from './window-post-message-communicator/rendering-message'
import { setDarkMode } from '../../redux/dark-mode/methods'
import type { ImageClickHandler } from '../markdown-renderer/markdown-extension/image/proxy-image-replacer'
import { useImageClickHandler } from './hooks/use-image-click-handler'
import { MarkdownDocument } from './markdown-document'
import { countWords } from './word-counter'
import { useRendererToEditorCommunicator } from '../editor-page/render-context/renderer-to-editor-communicator-context-provider'
import { useRendererReceiveHandler } from './window-post-message-communicator/hooks/use-renderer-receive-handler'
import { SlideshowMarkdownRenderer } from '../markdown-renderer/slideshow-markdown-renderer'
import { initialState } from '../../redux/note-details/initial-state'
import type { RendererFrontmatterInfo } from '../../redux/note-details/types/note-details'

/**
 * Wraps the markdown rendering in an iframe.
 */
export const IframeMarkdownRenderer: React.FC = () => {
  const [markdownContentLines, setMarkdownContentLines] = useState<string[]>([])
  const [scrollState, setScrollState] = useState<ScrollState>({ firstLineInView: 1, scrolledPercentage: 0 })
  const [baseConfiguration, setBaseConfiguration] = useState<BaseConfiguration | undefined>(undefined)
  const [frontmatterInfo, setFrontmatterInfo] = useState<RendererFrontmatterInfo>(initialState.frontmatterRendererInfo)

  const communicator = useRendererToEditorCommunicator()

  const sendScrolling = useRef<boolean>(false)

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
    useCallback((values) => setMarkdownContentLines(values.content), [])
  )

  useRendererReceiveHandler(
    CommunicationMessageType.SET_DARKMODE,
    useCallback((values) => setDarkMode(values.activated), [])
  )

  useRendererReceiveHandler(
    CommunicationMessageType.SET_SCROLL_STATE,
    useCallback((values) => setScrollState(values.scrollState), [])
  )

  useRendererReceiveHandler(
    CommunicationMessageType.SET_FRONTMATTER_INFO,
    useCallback((values) => setFrontmatterInfo(values.frontmatterInfo), [])
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

  const onTaskCheckedChange = useCallback(
    (lineInMarkdown: number, checked: boolean) => {
      communicator.sendMessageToOtherSide({
        type: CommunicationMessageType.ON_TASK_CHECKBOX_CHANGE,
        checked,
        lineInMarkdown
      })
    },
    [communicator]
  )

  const onFirstHeadingChange = useCallback(
    (firstHeading?: string) => {
      communicator.sendMessageToOtherSide({
        type: CommunicationMessageType.ON_FIRST_HEADING_CHANGE,
        firstHeading
      })
    },
    [communicator]
  )

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

  const onImageClick: ImageClickHandler = useImageClickHandler(communicator)

  const onHeightChange = useCallback(
    (height: number) => {
      communicator.sendMessageToOtherSide({
        type: CommunicationMessageType.ON_HEIGHT_CHANGE,
        height
      })
    },
    [communicator]
  )

  if (!baseConfiguration) {
    return null
  }

  switch (baseConfiguration.rendererType) {
    case RendererType.DOCUMENT:
      return (
        <MarkdownDocument
          additionalOuterContainerClasses={'vh-100 bg-light'}
          markdownContentLines={markdownContentLines}
          onTaskCheckedChange={onTaskCheckedChange}
          onFirstHeadingChange={onFirstHeadingChange}
          onMakeScrollSource={onMakeScrollSource}
          scrollState={scrollState}
          onScroll={onScroll}
          baseUrl={baseConfiguration.baseUrl}
          onImageClick={onImageClick}
          frontmatterInfo={frontmatterInfo}
        />
      )
    case RendererType.SLIDESHOW:
      return (
        <SlideshowMarkdownRenderer
          markdownContentLines={markdownContentLines}
          baseUrl={baseConfiguration.baseUrl}
          onFirstHeadingChange={onFirstHeadingChange}
          onImageClick={onImageClick}
          scrollState={scrollState}
          lineOffset={frontmatterInfo.lineOffset}
          slideOptions={frontmatterInfo.slideOptions}
        />
      )
    case RendererType.INTRO:
      return (
        <MarkdownDocument
          additionalOuterContainerClasses={'vh-100 bg-light overflow-y-hidden'}
          markdownContentLines={markdownContentLines}
          baseUrl={baseConfiguration.baseUrl}
          onImageClick={onImageClick}
          disableToc={true}
          onHeightChange={onHeightChange}
        />
      )
    default:
      return null
  }
}
