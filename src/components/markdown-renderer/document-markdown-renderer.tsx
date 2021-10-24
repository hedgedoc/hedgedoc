/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo, useRef } from 'react'
import { DocumentLengthLimitReachedAlert } from './document-length-limit-reached-alert'
import { useConvertMarkdownToReactDom } from './hooks/use-convert-markdown-to-react-dom'
import './markdown-renderer.scss'
import type { LineMarkerPosition } from './types'
import { useComponentReplacers } from './hooks/use-component-replacers'
import { useTranslation } from 'react-i18next'
import type { LineMarkers } from './replace-components/linemarker/line-number-marker'
import { useCalculateLineMarkerPosition } from './utils/calculate-line-marker-positions'
import { useExtractFirstHeadline } from './hooks/use-extract-first-headline'
import type { TocAst } from 'markdown-it-toc-done-right'
import { useOnRefChange } from './hooks/use-on-ref-change'
import { useTrimmedContent } from './hooks/use-trimmed-content'
import type { CommonMarkdownRendererProps } from './common-markdown-renderer-props'
import { DocumentMarkdownItConfigurator } from './markdown-it-configurator/document-markdown-it-configurator'

export interface DocumentMarkdownRendererProps extends CommonMarkdownRendererProps {
  onLineMarkerPositionChanged?: (lineMarkerPosition: LineMarkerPosition[]) => void
}

export const DocumentMarkdownRenderer: React.FC<DocumentMarkdownRendererProps> = ({
  className,
  content,
  onFirstHeadingChange,
  onLineMarkerPositionChanged,
  onTaskCheckedChange,
  onTocChange,
  baseUrl,
  onImageClick,
  outerContainerRef,
  useAlternativeBreaks,
  lineOffset
}) => {
  const markdownBodyRef = useRef<HTMLDivElement>(null)
  const currentLineMarkers = useRef<LineMarkers[]>()
  const tocAst = useRef<TocAst>()
  const [trimmedContent, contentExceedsLimit] = useTrimmedContent(content)

  const markdownIt = useMemo(
    () =>
      new DocumentMarkdownItConfigurator({
        onTocChange: (toc) => (tocAst.current = toc),
        onLineMarkers:
          onLineMarkerPositionChanged === undefined
            ? undefined
            : (lineMarkers) => (currentLineMarkers.current = lineMarkers),
        useAlternativeBreaks,
        lineOffset
      }).buildConfiguredMarkdownIt(),
    [onLineMarkerPositionChanged, useAlternativeBreaks, lineOffset]
  )
  const replacers = useComponentReplacers(onTaskCheckedChange, onImageClick, baseUrl, lineOffset)
  const markdownReactDom = useConvertMarkdownToReactDom(trimmedContent, markdownIt, replacers)

  useTranslation()
  useCalculateLineMarkerPosition(
    markdownBodyRef,
    currentLineMarkers.current,
    onLineMarkerPositionChanged,
    markdownBodyRef.current?.offsetTop ?? 0
  )
  useExtractFirstHeadline(markdownBodyRef, content, onFirstHeadingChange)
  useOnRefChange(tocAst, onTocChange)

  return (
    <div ref={outerContainerRef} className={'position-relative'}>
      <DocumentLengthLimitReachedAlert show={contentExceedsLimit} />
      <div
        ref={markdownBodyRef}
        className={`${className ?? ''} markdown-body w-100 d-flex flex-column align-items-center`}>
        {markdownReactDom}
      </div>
    </div>
  )
}

export default DocumentMarkdownRenderer
