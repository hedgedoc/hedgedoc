/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { TocAst } from 'markdown-it-toc-done-right'
import type { MutableRefObject } from 'react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import useResizeObserver from 'use-resize-observer'
import { YamlArrayDeprecationAlert } from '../editor-page/renderer-pane/yaml-array-deprecation-alert'
import { useDocumentSyncScrolling } from './hooks/sync-scroll/use-document-sync-scrolling'
import type { ScrollProps } from '../editor-page/synced-scroll/scroll-props'
import { DocumentMarkdownRenderer } from '../markdown-renderer/document-markdown-renderer'
import type { ImageClickHandler } from '../markdown-renderer/markdown-extension/image/proxy-image-replacer'
import styles from './markdown-document.module.scss'
import { WidthBasedTableOfContents } from './width-based-table-of-contents'
import { ShowIf } from '../common/show-if/show-if'
import { useApplicationState } from '../../hooks/common/use-application-state'
import { InvalidYamlAlert } from '../markdown-renderer/invalid-yaml-alert'
import type { RendererFrontmatterInfo } from '../../redux/note-details/types/note-details'

export interface RendererProps extends ScrollProps {
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
  onTaskCheckedChange?: (lineInMarkdown: number, checked: boolean) => void
  documentRenderPaneRef?: MutableRefObject<HTMLDivElement | null>
  markdownContentLines: string[]
  onImageClick?: ImageClickHandler
  onHeightChange?: (height: number) => void
}

export interface MarkdownDocumentProps extends RendererProps {
  additionalOuterContainerClasses?: string
  additionalRendererClasses?: string
  disableToc?: boolean
  baseUrl: string
  frontmatterInfo?: RendererFrontmatterInfo
}

export const MarkdownDocument: React.FC<MarkdownDocumentProps> = ({
  additionalOuterContainerClasses,
  additionalRendererClasses,
  onFirstHeadingChange,
  onMakeScrollSource,
  onTaskCheckedChange,
  baseUrl,
  markdownContentLines,
  onImageClick,
  onScroll,
  scrollState,
  onHeightChange,
  disableToc,
  frontmatterInfo
}) => {
  const rendererRef = useRef<HTMLDivElement | null>(null)
  const rendererSize = useResizeObserver({ ref: rendererRef.current })

  const internalDocumentRenderPaneRef = useRef<HTMLDivElement>(null)
  const internalDocumentRenderPaneSize = useResizeObserver({ ref: internalDocumentRenderPaneRef.current })
  const containerWidth = internalDocumentRenderPaneSize.width ?? 0

  const [tocAst, setTocAst] = useState<TocAst>()

  const newlinesAreBreaks = useApplicationState((state) => state.noteDetails.frontmatter.newlinesAreBreaks)

  useEffect(() => {
    if (!onHeightChange) {
      return
    }
    onHeightChange(rendererSize.height ? rendererSize.height + 1 : 0)
  }, [rendererSize.height, onHeightChange])

  const contentLineCount = useMemo(() => markdownContentLines.length, [markdownContentLines])
  const [onLineMarkerPositionChanged, onUserScroll] = useDocumentSyncScrolling(
    internalDocumentRenderPaneRef,
    rendererRef,
    contentLineCount,
    scrollState,
    onScroll
  )

  return (
    <div
      className={`${styles['markdown-document']} ${additionalOuterContainerClasses ?? ''}`}
      ref={internalDocumentRenderPaneRef}
      onScroll={onUserScroll}
      data-scroll-element={true}
      onMouseEnter={onMakeScrollSource}
      onTouchStart={onMakeScrollSource}>
      <div className={styles['markdown-document-side']} />
      <div className={styles['markdown-document-content']}>
        <InvalidYamlAlert show={!!frontmatterInfo?.frontmatterInvalid} />
        <YamlArrayDeprecationAlert show={!!frontmatterInfo?.deprecatedSyntax} />
        <DocumentMarkdownRenderer
          outerContainerRef={rendererRef}
          className={`mb-3 ${additionalRendererClasses ?? ''}`}
          markdownContentLines={markdownContentLines}
          onFirstHeadingChange={onFirstHeadingChange}
          onLineMarkerPositionChanged={onLineMarkerPositionChanged}
          onTaskCheckedChange={onTaskCheckedChange}
          onTocChange={setTocAst}
          baseUrl={baseUrl}
          onImageClick={onImageClick}
          newlinesAreBreaks={newlinesAreBreaks}
          lineOffset={frontmatterInfo?.lineOffset}
        />
      </div>
      <div className={`${styles['markdown-document-side']} pt-4`}>
        <ShowIf condition={!!tocAst && !disableToc}>
          <WidthBasedTableOfContents tocAst={tocAst as TocAst} baseUrl={baseUrl} width={containerWidth} />
        </ShowIf>
      </div>
    </div>
  )
}
