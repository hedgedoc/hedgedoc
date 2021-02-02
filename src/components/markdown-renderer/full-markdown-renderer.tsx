/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TocAst } from 'markdown-it-toc-done-right'
import React, { Ref, useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NoteFrontmatter, RawNoteFrontmatter } from '../editor-page/note-frontmatter/note-frontmatter'
import { BasicMarkdownRenderer } from './basic-markdown-renderer'
import { useExtractFirstHeadline } from './hooks/use-extract-first-headline'
import { usePostFrontmatterOnChange } from './hooks/use-post-frontmatter-on-change'
import { usePostTocAstOnChange } from './hooks/use-post-toc-ast-on-change'
import { useReplacerInstanceListCreator } from './hooks/use-replacer-instance-list-creator'
import { InvalidYamlAlert } from './invalid-yaml-alert'
import { FullMarkdownItConfigurator } from './markdown-it-configurator/FullMarkdownItConfigurator'
import { ImageClickHandler } from './replace-components/image/image-replacer'
import { LineMarkers } from './replace-components/linemarker/line-number-marker'
import { AdditionalMarkdownRendererProps, LineMarkerPosition } from './types'
import { useCalculateLineMarkerPosition } from './utils/calculate-line-marker-positions'

export interface FullMarkdownRendererProps {
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
  onLineMarkerPositionChanged?: (lineMarkerPosition: LineMarkerPosition[]) => void
  onFrontmatterChange?: (frontmatter: NoteFrontmatter | undefined) => void
  onTaskCheckedChange?: (lineInMarkdown: number, checked: boolean) => void
  onTocChange?: (ast: TocAst) => void
  rendererRef?: Ref<HTMLDivElement>
  baseUrl?: string
  onImageClick?: ImageClickHandler
}

export const FullMarkdownRenderer: React.FC<FullMarkdownRendererProps & AdditionalMarkdownRendererProps> = (
  {
    onFirstHeadingChange,
    onLineMarkerPositionChanged,
    onFrontmatterChange,
    onTaskCheckedChange,
    onTocChange,
    content,
    className,
    rendererRef,
    baseUrl,
    onImageClick
  }) => {
  const allReplacers = useReplacerInstanceListCreator(onTaskCheckedChange, onImageClick, baseUrl)
  useTranslation()

  const [showYamlError, setShowYamlError] = useState(false)
  const hasNewYamlError = useRef(false)

  const rawMetaRef = useRef<RawNoteFrontmatter>()
  const firstHeadingRef = useRef<string>()
  const documentElement = useRef<HTMLDivElement>(null)
  const currentLineMarkers = useRef<LineMarkers[]>()
  usePostFrontmatterOnChange(rawMetaRef.current, firstHeadingRef.current, onFrontmatterChange, onFirstHeadingChange)
  useCalculateLineMarkerPosition(documentElement, currentLineMarkers.current, onLineMarkerPositionChanged, documentElement.current?.offsetTop ?? 0)
  useExtractFirstHeadline(documentElement, content, onFirstHeadingChange)

  const tocAst = useRef<TocAst>()
  usePostTocAstOnChange(tocAst, onTocChange)

  const markdownIt = useMemo(() => {
    return (new FullMarkdownItConfigurator(
      !!onFrontmatterChange,
      errorState => hasNewYamlError.current = errorState,
      rawMeta => {
        rawMetaRef.current = rawMeta
      },
      toc => {
        tocAst.current = toc
      },
      lineMarkers => {
        currentLineMarkers.current = lineMarkers
      }
    )).buildConfiguredMarkdownIt()
  }, [onFrontmatterChange])

  const clearFrontmatter = useCallback(() => {
    hasNewYamlError.current = false
    rawMetaRef.current = undefined
  }, [])

  const checkYamlErrorState = useCallback(() => {
    if (hasNewYamlError.current !== showYamlError) {
      setShowYamlError(hasNewYamlError.current)
    }
  }, [setShowYamlError, showYamlError])

  return (
    <div ref={rendererRef} className={'position-relative'}>
      <InvalidYamlAlert showYamlError={showYamlError}/>
      <BasicMarkdownRenderer
        className={className}
        content={content}
        componentReplacers={allReplacers}
        markdownIt={markdownIt}
        documentReference={documentElement}
        onBeforeRendering={clearFrontmatter}
        onAfterRendering={checkYamlErrorState}/>
    </div>
  )
}
