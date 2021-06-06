/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Ref, useCallback, useMemo, useRef, useState } from 'react'
import { DocumentLengthLimitReachedAlert } from './document-length-limit-reached-alert'
import { useConvertMarkdownToReactDom } from './hooks/use-convert-markdown-to-react-dom'
import './markdown-renderer.scss'
import { ComponentReplacer } from './replace-components/ComponentReplacer'
import { AdditionalMarkdownRendererProps, LineMarkerPosition } from './types'
import { useComponentReplacers } from './hooks/use-component-replacers'
import { useTranslation } from 'react-i18next'
import { NoteFrontmatter, RawNoteFrontmatter } from '../editor-page/note-frontmatter/note-frontmatter'
import { LineMarkers } from './replace-components/linemarker/line-number-marker'
import { useCalculateLineMarkerPosition } from './utils/calculate-line-marker-positions'
import { useExtractFirstHeadline } from './hooks/use-extract-first-headline'
import { TocAst } from 'markdown-it-toc-done-right'
import { useOnRefChange } from './hooks/use-on-ref-change'
import { BasicMarkdownItConfigurator } from './markdown-it-configurator/BasicMarkdownItConfigurator'
import { ImageClickHandler } from './replace-components/image/image-replacer'
import { InvalidYamlAlert } from './invalid-yaml-alert'
import { useTrimmedContent } from './hooks/use-trimmed-content'

export interface BasicMarkdownRendererProps {
  additionalReplacers?: () => ComponentReplacer[]
  onBeforeRendering?: () => void
  onAfterRendering?: () => void
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
  onLineMarkerPositionChanged?: (lineMarkerPosition: LineMarkerPosition[]) => void
  onFrontmatterChange?: (frontmatter: NoteFrontmatter | undefined) => void
  onTaskCheckedChange?: (lineInMarkdown: number, checked: boolean) => void
  onTocChange?: (ast?: TocAst) => void
  baseUrl?: string
  onImageClick?: ImageClickHandler
  outerContainerRef?: Ref<HTMLDivElement>
  useAlternativeBreaks?: boolean
}

export const BasicMarkdownRenderer: React.FC<BasicMarkdownRendererProps & AdditionalMarkdownRendererProps> = ({
  className,
  content,
  additionalReplacers,
  onBeforeRendering,
  onAfterRendering,
  onFirstHeadingChange,
  onLineMarkerPositionChanged,
  onFrontmatterChange,
  onTaskCheckedChange,
  onTocChange,
  baseUrl,
  onImageClick,
  outerContainerRef,
  useAlternativeBreaks
}) => {
  const rawMetaRef = useRef<RawNoteFrontmatter>()
  const markdownBodyRef = useRef<HTMLDivElement>(null)
  const currentLineMarkers = useRef<LineMarkers[]>()
  const hasNewYamlError = useRef(false)
  const tocAst = useRef<TocAst>()
  const [showYamlError, setShowYamlError] = useState(false)
  const [trimmedContent, contentExceedsLimit] = useTrimmedContent(content)

  const markdownIt = useMemo(
    () =>
      new BasicMarkdownItConfigurator({
        useFrontmatter: !!onFrontmatterChange,
        onParseError: (errorState) => (hasNewYamlError.current = errorState),
        onRawMetaChange: (rawMeta) => (rawMetaRef.current = rawMeta),
        onToc: (toc) => (tocAst.current = toc),
        onLineMarkers:
          onLineMarkerPositionChanged === undefined
            ? undefined
            : (lineMarkers) => (currentLineMarkers.current = lineMarkers),
        useAlternativeBreaks
      }).buildConfiguredMarkdownIt(),
    [onFrontmatterChange, onLineMarkerPositionChanged, useAlternativeBreaks]
  )

  const clearFrontmatter = useCallback(() => {
    hasNewYamlError.current = false
    rawMetaRef.current = undefined
    onBeforeRendering?.()
  }, [onBeforeRendering])

  const checkYamlErrorState = useCallback(() => {
    setShowYamlError(hasNewYamlError.current)
    onAfterRendering?.()
  }, [onAfterRendering])

  const baseReplacers = useComponentReplacers(onTaskCheckedChange, onImageClick, baseUrl)
  const markdownReactDom = useConvertMarkdownToReactDom(
    trimmedContent,
    markdownIt,
    baseReplacers,
    additionalReplacers,
    clearFrontmatter,
    checkYamlErrorState
  )

  useTranslation()
  useCalculateLineMarkerPosition(
    markdownBodyRef,
    currentLineMarkers.current,
    onLineMarkerPositionChanged,
    markdownBodyRef.current?.offsetTop ?? 0
  )
  useExtractFirstHeadline(markdownBodyRef, content, onFirstHeadingChange)
  useOnRefChange(tocAst, onTocChange)
  useOnRefChange(rawMetaRef, (newValue) => {
    if (!newValue) {
      onFrontmatterChange?.(undefined)
    } else {
      onFrontmatterChange?.(new NoteFrontmatter(newValue))
    }
  })

  return (
    <div ref={outerContainerRef} className={'position-relative'}>
      <InvalidYamlAlert show={showYamlError} />
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
