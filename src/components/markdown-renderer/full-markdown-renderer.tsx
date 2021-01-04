/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { TocAst } from 'markdown-it-toc-done-right'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../redux'
import { InternalLink } from '../common/links/internal-link'
import links from '../../links.json'
import { TranslatedExternalLink } from '../common/links/translated-external-link'
import { ShowIf } from '../common/show-if/show-if'
import { RawYAMLMetadata, YAMLMetaData } from '../editor/yaml-metadata/yaml-metadata'
import { BasicMarkdownRenderer } from './basic-markdown-renderer'
import { useExtractFirstHeadline } from './hooks/use-extract-first-headline'
import { usePostMetaDataOnChange } from './hooks/use-post-meta-data-on-change'
import { usePostTocAstOnChange } from './hooks/use-post-toc-ast-on-change'
import { useReplacerInstanceListCreator } from './hooks/use-replacer-instance-list-creator'
import { FullMarkdownItConfigurator } from './markdown-it-configurator/FullMarkdownItConfigurator'
import { LineMarkers } from './replace-components/linemarker/line-number-marker'
import { AdditionalMarkdownRendererProps, LineMarkerPosition } from './types'
import { useCalculateLineMarkerPosition } from './utils/calculate-line-marker-positions'

export interface FullMarkdownRendererProps {
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
  onLineMarkerPositionChanged?: (lineMarkerPosition: LineMarkerPosition[]) => void
  onMetaDataChange?: (yamlMetaData: YAMLMetaData | undefined) => void
  onTaskCheckedChange?: (lineInMarkdown: number, checked: boolean) => void
  onTocChange?: (ast: TocAst) => void
}

export const FullMarkdownRenderer: React.FC<FullMarkdownRendererProps & AdditionalMarkdownRendererProps> = ({
  onFirstHeadingChange,
  onLineMarkerPositionChanged,
  onMetaDataChange,
  onTaskCheckedChange,
  onTocChange,
  content,
  className,
  wide
}) => {
  const allReplacers = useReplacerInstanceListCreator(onTaskCheckedChange)
  useTranslation()

  const [yamlError, setYamlError] = useState(false)
  const yamlDeprecatedTags = useSelector((state: ApplicationState) => state.documentContent.metadata.deprecatedTagsSyntax)

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
      error => setYamlError(error),
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
    rawMetaRef.current = undefined
  }, [])

  return (
    <div className={'position-relative'}>
      <ShowIf condition={yamlError}>
        <Alert variant='warning' dir='auto'>
          <Trans i18nKey='editor.invalidYaml'>
            <InternalLink text='yaml-metadata' href='/n/yaml-metadata' className='text-primary'/>
          </Trans>
        </Alert>
      </ShowIf>
      <ShowIf condition={yamlDeprecatedTags}>
        <Alert variant='warning' dir='auto'>
          <Trans i18nKey='editor.deprecatedTags' />
          <br/>
          <TranslatedExternalLink i18nKey={'common.readForMoreInfo'} href={links.faq} className={'text-primary'}/>
        </Alert>
      </ShowIf>
      <BasicMarkdownRenderer className={className} wide={wide} content={content} componentReplacers={allReplacers}
        markdownIt={markdownIt} documentReference={documentElement}
        onBeforeRendering={clearMetadata}/>
    </div>
  )
}
