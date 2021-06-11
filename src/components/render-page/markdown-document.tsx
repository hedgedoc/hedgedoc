/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TocAst } from 'markdown-it-toc-done-right'
import React, { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import useResizeObserver from 'use-resize-observer'
import { NoteFrontmatter } from '../editor-page/note-frontmatter/note-frontmatter'
import { YamlArrayDeprecationAlert } from '../editor-page/renderer-pane/yaml-array-deprecation-alert'
import { useSyncedScrolling } from '../editor-page/synced-scroll/hooks/use-synced-scrolling'
import { ScrollProps } from '../editor-page/synced-scroll/scroll-props'
import { BasicMarkdownRenderer } from '../markdown-renderer/basic-markdown-renderer'
import { ImageClickHandler } from '../markdown-renderer/replace-components/image/image-replacer'
import './markdown-document.scss'
import { WidthBasedTableOfContents } from './width-based-table-of-contents'
import { ShowIf } from '../common/show-if/show-if'
import { useApplicationState } from '../../hooks/common/use-application-state'

export interface RendererProps extends ScrollProps {
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
  onFrontmatterChange?: (frontmatter: NoteFrontmatter | undefined) => void
  onTaskCheckedChange?: (lineInMarkdown: number, checked: boolean) => void
  documentRenderPaneRef?: MutableRefObject<HTMLDivElement | null>
  markdownContent: string
  onImageClick?: ImageClickHandler
  onHeightChange?: (height: number) => void
}

export interface MarkdownDocumentProps extends RendererProps {
  additionalOuterContainerClasses?: string
  additionalRendererClasses?: string
  disableToc?: boolean
  baseUrl: string
}

export const MarkdownDocument: React.FC<MarkdownDocumentProps> = ({
  additionalOuterContainerClasses,
  additionalRendererClasses,
  onFirstHeadingChange,
  onFrontmatterChange,
  onMakeScrollSource,
  onTaskCheckedChange,
  baseUrl,
  markdownContent,
  onImageClick,
  onScroll,
  scrollState,
  onHeightChange,
  disableToc
}) => {
  const rendererRef = useRef<HTMLDivElement | null>(null)
  const rendererSize = useResizeObserver({ ref: rendererRef.current })

  const internalDocumentRenderPaneRef = useRef<HTMLDivElement>(null)
  const internalDocumentRenderPaneSize = useResizeObserver({ ref: internalDocumentRenderPaneRef.current })
  const containerWidth = internalDocumentRenderPaneSize.width ?? 0

  const [tocAst, setTocAst] = useState<TocAst>()

  const useAlternativeBreaks = useApplicationState((state) => state.noteDetails.frontmatter.breaks)

  useEffect(() => {
    if (!onHeightChange) {
      return
    }
    onHeightChange(rendererSize.height ? rendererSize.height + 1 : 0)
  }, [rendererSize.height, onHeightChange])

  const contentLineCount = useMemo(() => markdownContent.split('\n').length, [markdownContent])
  const [onLineMarkerPositionChanged, onUserScroll] = useSyncedScrolling(
    internalDocumentRenderPaneRef,
    rendererRef,
    contentLineCount,
    scrollState,
    onScroll
  )

  return (
    <div
      className={`markdown-document ${additionalOuterContainerClasses ?? ''}`}
      ref={internalDocumentRenderPaneRef}
      onScroll={onUserScroll}
      onMouseEnter={onMakeScrollSource}>
      <div className={'markdown-document-side'} />
      <div className={'markdown-document-content'}>
        <YamlArrayDeprecationAlert />
        <BasicMarkdownRenderer
          outerContainerRef={rendererRef}
          className={`mb-3 ${additionalRendererClasses ?? ''}`}
          content={markdownContent}
          onFirstHeadingChange={onFirstHeadingChange}
          onLineMarkerPositionChanged={onLineMarkerPositionChanged}
          onFrontmatterChange={onFrontmatterChange}
          onTaskCheckedChange={onTaskCheckedChange}
          onTocChange={setTocAst}
          baseUrl={baseUrl}
          onImageClick={onImageClick}
          useAlternativeBreaks={useAlternativeBreaks}
        />
      </div>
      <div className={'markdown-document-side pt-4'}>
        <ShowIf condition={!!tocAst && !disableToc}>
          <WidthBasedTableOfContents tocAst={tocAst as TocAst} baseUrl={baseUrl} width={containerWidth} />
        </ShowIf>
      </div>
    </div>
  )
}
