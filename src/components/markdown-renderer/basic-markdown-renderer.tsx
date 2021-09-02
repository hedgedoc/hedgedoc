/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Ref, useCallback, useMemo, useRef } from 'react'
import { DocumentLengthLimitReachedAlert } from './document-length-limit-reached-alert'
import { useConvertMarkdownToReactDom } from './hooks/use-convert-markdown-to-react-dom'
import './markdown-renderer.scss'
import { ComponentReplacer } from './replace-components/ComponentReplacer'
import { AdditionalMarkdownRendererProps, LineMarkerPosition } from './types'
import { useComponentReplacers } from './hooks/use-component-replacers'
import { useTranslation } from 'react-i18next'
import { LineMarkers } from './replace-components/linemarker/line-number-marker'
import { useCalculateLineMarkerPosition } from './utils/calculate-line-marker-positions'
import { useExtractFirstHeadline } from './hooks/use-extract-first-headline'
import { TocAst } from 'markdown-it-toc-done-right'
import { useOnRefChange } from './hooks/use-on-ref-change'
import { BasicMarkdownItConfigurator } from './markdown-it-configurator/BasicMarkdownItConfigurator'
import { ImageClickHandler } from './replace-components/image/image-replacer'
import { useTrimmedContent } from './hooks/use-trimmed-content'

export interface BasicMarkdownRendererProps {
  additionalReplacers?: () => ComponentReplacer[]
  onBeforeRendering?: () => void
  onAfterRendering?: () => void
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
  onLineMarkerPositionChanged?: (lineMarkerPosition: LineMarkerPosition[]) => void
  onTaskCheckedChange?: (lineInMarkdown: number, checked: boolean) => void
  onTocChange?: (ast?: TocAst) => void
  baseUrl?: string
  onImageClick?: ImageClickHandler
  outerContainerRef?: Ref<HTMLDivElement>
  useAlternativeBreaks?: boolean
  frontmatterLineOffset?: number
}

export const BasicMarkdownRenderer: React.FC<BasicMarkdownRendererProps & AdditionalMarkdownRendererProps> = ({
  className,
  content,
  additionalReplacers,
  onFirstHeadingChange,
  onLineMarkerPositionChanged,
  onTaskCheckedChange,
  onTocChange,
  baseUrl,
  onImageClick,
  outerContainerRef,
  useAlternativeBreaks,
  frontmatterLineOffset
}) => {
  const markdownBodyRef = useRef<HTMLDivElement>(null)
  const currentLineMarkers = useRef<LineMarkers[]>()
  const hasNewYamlError = useRef(false)
  const tocAst = useRef<TocAst>()
  const [trimmedContent, contentExceedsLimit] = useTrimmedContent(content)

  const markdownIt = useMemo(
    () =>
      new BasicMarkdownItConfigurator({
        onParseError: (errorState) => (hasNewYamlError.current = errorState),
        onToc: (toc) => (tocAst.current = toc),
        onLineMarkers:
          onLineMarkerPositionChanged === undefined
            ? undefined
            : (lineMarkers) => (currentLineMarkers.current = lineMarkers),
        useAlternativeBreaks,
        offsetLines: frontmatterLineOffset
      }).buildConfiguredMarkdownIt(),
    [onLineMarkerPositionChanged, useAlternativeBreaks, frontmatterLineOffset]
  )

  const baseReplacers = useComponentReplacers(onTaskCheckedChange, onImageClick, baseUrl, frontmatterLineOffset)
  const replacers = useCallback(
    () => baseReplacers().concat(additionalReplacers ? additionalReplacers() : []),
    [additionalReplacers, baseReplacers]
  )

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

export default BasicMarkdownRenderer
