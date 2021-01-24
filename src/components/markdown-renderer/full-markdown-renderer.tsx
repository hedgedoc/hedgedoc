/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TocAst } from 'markdown-it-toc-done-right'
import React, { Ref, useCallback, useMemo, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { InternalLink } from '../common/links/internal-link'
import { ShowIf } from '../common/show-if/show-if'
import { RawYAMLMetadata, YAMLMetaData } from '../editor/yaml-metadata/yaml-metadata'
import { BasicMarkdownRenderer } from './basic-markdown-renderer'
import { useExtractFirstHeadline } from './hooks/use-extract-first-headline'
import { usePostMetaDataOnChange } from './hooks/use-post-meta-data-on-change'
import { usePostTocAstOnChange } from './hooks/use-post-toc-ast-on-change'
import { useReplacerInstanceListCreator } from './hooks/use-replacer-instance-list-creator'
import { FullMarkdownItConfigurator } from './markdown-it-configurator/FullMarkdownItConfigurator'
import { ImageClickHandler } from './replace-components/image/image-replacer'
import { LineMarkers } from './replace-components/linemarker/line-number-marker'
import { AdditionalMarkdownRendererProps, LineMarkerPosition } from './types'
import { useCalculateLineMarkerPosition } from './utils/calculate-line-marker-positions'

export interface FullMarkdownRendererProps {
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
  onLineMarkerPositionChanged?: (lineMarkerPosition: LineMarkerPosition[]) => void
  onMetaDataChange?: (yamlMetaData: YAMLMetaData | undefined) => void
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
    onMetaDataChange,
    onTaskCheckedChange,
    onTocChange,
    content,
    className,
    wide,
    rendererRef,
    baseUrl,
    onImageClick
  }) => {
  const allReplacers = useReplacerInstanceListCreator(onTaskCheckedChange, onImageClick, baseUrl)
  useTranslation()

  const [showYamlError, setShowYamlError] = useState(false)
  const hasNewYamlError = useRef(false)

  const rawMetaRef = useRef<RawYAMLMetadata>()
  const firstHeadingRef = useRef<string>()
  const documentElement = useRef<HTMLDivElement>(null)
  const currentLineMarkers = useRef<LineMarkers[]>()
  usePostMetaDataOnChange(rawMetaRef.current, firstHeadingRef.current, onMetaDataChange, onFirstHeadingChange)
  useCalculateLineMarkerPosition(documentElement, currentLineMarkers.current, onLineMarkerPositionChanged, documentElement.current?.offsetTop ?? 0)
  useExtractFirstHeadline(documentElement, content, onFirstHeadingChange)

  const tocAst = useRef<TocAst>()
  usePostTocAstOnChange(tocAst, onTocChange)

  const markdownIt = useMemo(() => {
    return (new FullMarkdownItConfigurator(
      !!onMetaDataChange,
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
  }, [onMetaDataChange])

  const clearMetadata = useCallback(() => {
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
      <ShowIf condition={showYamlError}>
        <Alert variant='warning' dir='auto'>
          <Trans i18nKey='editor.invalidYaml'>
            <InternalLink text='yaml-metadata' href='/n/yaml-metadata' className='text-primary'/>
          </Trans>
        </Alert>
      </ShowIf>
      <BasicMarkdownRenderer
        className={className}
        wide={wide}
        content={content}
        componentReplacers={allReplacers}
        markdownIt={markdownIt}
        documentReference={documentElement}
        onBeforeRendering={clearMetadata}
        onAfterRendering={checkYamlErrorState}
      />
    </div>
  )
}
