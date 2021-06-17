/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useEffect, useState } from 'react'
import { ScrollState } from '../editor-page/synced-scroll/scroll-props'
import { BaseConfiguration, RendererType } from './rendering-message'
import { setDarkMode } from '../../redux/dark-mode/methods'
import { NoteFrontmatter } from '../editor-page/note-frontmatter/note-frontmatter'
import { setNoteFrontmatter } from '../../redux/note-details/methods'
import { ImageClickHandler } from '../markdown-renderer/replace-components/image/image-replacer'
import { useImageClickHandler } from './hooks/use-image-click-handler'
import { MarkdownDocument } from './markdown-document'
import { useIFrameRendererToEditorCommunicator } from '../editor-page/render-context/iframe-renderer-to-editor-communicator-context-provider'
import { countWords } from './word-counter'

export const IframeMarkdownRenderer: React.FC = () => {
  const [markdownContent, setMarkdownContent] = useState('')
  const [scrollState, setScrollState] = useState<ScrollState>({ firstLineInView: 1, scrolledPercentage: 0 })
  const [baseConfiguration, setBaseConfiguration] = useState<BaseConfiguration | undefined>(undefined)

  const iframeCommunicator = useIFrameRendererToEditorCommunicator()

  const countWordsInRenderedDocument = useCallback(() => {
    const documentContainer = document.querySelector('.markdown-body')
    if (!documentContainer) {
      iframeCommunicator?.sendWordCountCalculated(0)
      return
    }
    const wordCount = countWords(documentContainer)
    iframeCommunicator?.sendWordCountCalculated(wordCount)
  }, [iframeCommunicator])

  useEffect(() => iframeCommunicator?.onSetBaseConfiguration(setBaseConfiguration), [iframeCommunicator])
  useEffect(() => iframeCommunicator?.onSetMarkdownContent(setMarkdownContent), [iframeCommunicator])
  useEffect(() => iframeCommunicator?.onSetDarkMode(setDarkMode), [iframeCommunicator])
  useEffect(() => iframeCommunicator?.onSetScrollState(setScrollState), [iframeCommunicator, scrollState])
  useEffect(
    () => iframeCommunicator?.onGetWordCount(countWordsInRenderedDocument),
    [iframeCommunicator, countWordsInRenderedDocument]
  )

  const onTaskCheckedChange = useCallback(
    (lineInMarkdown: number, checked: boolean) => {
      iframeCommunicator?.sendTaskCheckBoxChange(lineInMarkdown, checked)
    },
    [iframeCommunicator]
  )

  const onFirstHeadingChange = useCallback(
    (firstHeading?: string) => {
      iframeCommunicator?.sendFirstHeadingChanged(firstHeading)
    },
    [iframeCommunicator]
  )

  const onMakeScrollSource = useCallback(() => {
    iframeCommunicator?.sendSetScrollSourceToRenderer()
  }, [iframeCommunicator])

  const onFrontmatterChange = useCallback(
    (frontmatter?: NoteFrontmatter) => {
      setNoteFrontmatter(frontmatter)
      iframeCommunicator?.sendSetFrontmatter(frontmatter)
    },
    [iframeCommunicator]
  )

  const onScroll = useCallback(
    (scrollState: ScrollState) => {
      iframeCommunicator?.sendSetScrollState(scrollState)
    },
    [iframeCommunicator]
  )

  const onImageClick: ImageClickHandler = useImageClickHandler(iframeCommunicator)

  const onHeightChange = useCallback(
    (height: number) => {
      iframeCommunicator?.sendHeightChange(height)
    },
    [iframeCommunicator]
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
          onFrontmatterChange={onFrontmatterChange}
          scrollState={scrollState}
          onScroll={onScroll}
          baseUrl={baseConfiguration.baseUrl}
          onImageClick={onImageClick}
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
