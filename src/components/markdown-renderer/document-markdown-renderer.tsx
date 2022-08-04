/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useMemo, useRef } from 'react'
import { useConvertMarkdownToReactDom } from './hooks/use-convert-markdown-to-react-dom'
import type { LineMarkerPosition } from './markdown-extension/linemarker/types'
import { useTranslation } from 'react-i18next'
import type { LineMarkers } from './markdown-extension/linemarker/add-line-marker-markdown-it-plugin'
import { useCalculateLineMarkerPosition } from './utils/calculate-line-marker-positions'
import { useExtractFirstHeadline } from './hooks/use-extract-first-headline'
import type { CommonMarkdownRendererProps } from './common-markdown-renderer-props'
import { useMarkdownExtensions } from './hooks/use-markdown-extensions'
import { HeadlineAnchorsMarkdownExtension } from './markdown-extension/headline-anchors-markdown-extension'
import { cypressId } from '../../utils/cypress-attribute'

export interface DocumentMarkdownRendererProps extends CommonMarkdownRendererProps {
  onLineMarkerPositionChanged?: (lineMarkerPosition: LineMarkerPosition[]) => void
}

/**
 * Renders the note as normal document.
 *
 * @param className Additional class names directly given to the div
 * @param markdownContentLines The markdown lines
 * @param onFirstHeadingChange The callback to call if the first heading changes.
 * @param onLineMarkerPositionChanged The callback to call with changed {@link LineMarkers}
 * @param onTaskCheckedChange The callback to call if a task is checked or unchecked.
 * @param onTocChange The callback to call if the toc changes.
 * @param baseUrl The base url of the renderer
 * @param onImageClick The callback to call if a image is clicked
 * @param outerContainerRef A reference for the outer container
 * @param newlinesAreBreaks If newlines are rendered as breaks or not
 */
export const DocumentMarkdownRenderer: React.FC<DocumentMarkdownRendererProps> = ({
  className,
  markdownContentLines,
  onFirstHeadingChange,
  onLineMarkerPositionChanged,
  onTaskCheckedChange,
  onTocChange,
  baseUrl,
  onImageClick,
  outerContainerRef,
  newlinesAreBreaks
}) => {
  const markdownBodyRef = useRef<HTMLDivElement>(null)
  const currentLineMarkers = useRef<LineMarkers[]>()

  const extensions = useMarkdownExtensions(
    baseUrl,
    currentLineMarkers,
    useMemo(() => [new HeadlineAnchorsMarkdownExtension()], []),
    onTaskCheckedChange,
    onImageClick,
    onTocChange
  )
  const markdownReactDom = useConvertMarkdownToReactDom(markdownContentLines, extensions, newlinesAreBreaks)

  useTranslation()
  useCalculateLineMarkerPosition(
    markdownBodyRef,
    currentLineMarkers.current,
    onLineMarkerPositionChanged,
    markdownBodyRef.current?.offsetTop ?? 0
  )
  const extractFirstHeadline = useExtractFirstHeadline(markdownBodyRef, onFirstHeadingChange)
  useEffect(() => {
    extractFirstHeadline()
  }, [extractFirstHeadline, markdownContentLines])

  return (
    <div ref={outerContainerRef} className={`position-relative`}>
      <div
        {...cypressId('markdown-body')}
        ref={markdownBodyRef}
        data-word-count-target={true}
        className={`${className ?? ''} markdown-body w-100 d-flex flex-column align-items-center`}>
        {markdownReactDom}
      </div>
    </div>
  )
}

export default DocumentMarkdownRenderer
