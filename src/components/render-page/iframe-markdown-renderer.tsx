/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useState } from 'react'
import type { ScrollState } from '../editor-page/synced-scroll/scroll-props'
import type { BaseConfiguration } from './window-post-message-communicator/rendering-message'
import { CommunicationMessageType, RendererType } from './window-post-message-communicator/rendering-message'
import { setDarkMode } from '../../redux/dark-mode/methods'
import type { ImageClickHandler } from '../markdown-renderer/markdown-extension/image/proxy-image-replacer'
import { useImageClickHandler } from './hooks/use-image-click-handler'
import { MarkdownDocument } from './markdown-document'
import { countWords } from './word-counter'
import type { RendererFrontmatterInfo } from '../common/note-frontmatter/types'
import { useRendererToEditorCommunicator } from '../editor-page/render-context/renderer-to-editor-communicator-context-provider'
import { useRendererReceiveHandler } from './window-post-message-communicator/hooks/use-renderer-receive-handler'
import { SlideshowMarkdownRenderer } from '../markdown-renderer/slideshow-markdown-renderer'
import { initialState } from '../../redux/note-details/initial-state'

export const IframeMarkdownRenderer: React.FC = () => {
  const [markdownContent, setMarkdownContent] = useState('')
  const [scrollState, setScrollState] = useState<ScrollState>({ firstLineInView: 1, scrolledPercentage: 0 })
  const [baseConfiguration, setBaseConfiguration] = useState<BaseConfiguration | undefined>(undefined)
  const [frontmatterInfo, setFrontmatterInfo] = useState<RendererFrontmatterInfo>(initialState.frontmatterRendererInfo)

  const communicator = useRendererToEditorCommunicator()

  const countWordsInRenderedDocument = useCallback(() => {
    const documentContainer = document.querySelector('.markdown-body')
    communicator.sendMessageToOtherSide({
      type: CommunicationMessageType.ON_WORD_COUNT_CALCULATED,
      words: documentContainer ? countWords(documentContainer) : 0
    })
  }, [communicator])

  useRendererReceiveHandler(CommunicationMessageType.SET_BASE_CONFIGURATION, (values) =>
    setBaseConfiguration(values.baseConfiguration)
  )
  useRendererReceiveHandler(CommunicationMessageType.SET_MARKDOWN_CONTENT, (values) =>
    setMarkdownContent(values.content)
  )
  useRendererReceiveHandler(CommunicationMessageType.SET_DARKMODE, (values) => setDarkMode(values.activated))
  useRendererReceiveHandler(CommunicationMessageType.SET_SCROLL_STATE, (values) => setScrollState(values.scrollState))
  useRendererReceiveHandler(CommunicationMessageType.SET_FRONTMATTER_INFO, (values) =>
    setFrontmatterInfo(values.frontmatterInfo)
  )
  useRendererReceiveHandler(CommunicationMessageType.GET_WORD_COUNT, () => countWordsInRenderedDocument())

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
    communicator.sendMessageToOtherSide({
      type: CommunicationMessageType.SET_SCROLL_SOURCE_TO_RENDERER
    })
  }, [communicator])

  const onScroll = useCallback(
    (scrollState: ScrollState) => {
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
          markdownContent={markdownContent}
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
          content={markdownContent}
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
          markdownContent={markdownContent}
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
