/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../hooks/common/use-application-state'
import type { ScrollProps } from '../editor-page/synced-scroll/scroll-props'
import { DocumentMarkdownRenderer } from '../markdown-renderer/document-markdown-renderer'
import { DocumentTocSidebar } from './document-toc-sidebar'
import { useDocumentSyncScrolling } from './hooks/sync-scroll/use-document-sync-scrolling'
import styles from './markdown-document.module.scss'
import useResizeObserver from '@react-hook/resize-observer'
import type { MutableRefObject } from 'react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

export interface RendererProps extends ScrollProps {
  documentRenderPaneRef?: MutableRefObject<HTMLDivElement | null>
  markdownContentLines: string[]
  onHeightChange?: (height: number) => void
}

export interface MarkdownDocumentProps extends RendererProps {
  additionalOuterContainerClasses?: string
  additionalRendererClasses?: string
  disableToc?: boolean
  baseUrl: string
}

/**
 * Renders a markdown document and handles scrolling, yaml metadata and a floating table of contents.
 *
 * @param additionalOuterContainerClasses Additional classes given to the outer container directly
 * @param additionalRendererClasses Additional classes given {@link DocumentMarkdownRenderer} directly
 * @param onMakeScrollSource The callback to call if a change of the scroll source is requested-
 * @param baseUrl The base url for the renderer
 * @param markdownContentLines The current content of the markdown document.
 * @param onScroll The callback to call if the renderer is scrolling.
 * @param scrollState The current {@link ScrollState}
 * @param onHeightChange The callback to call if the height of the document changes
 * @param disableToc If the table of contents should be disabled.
 * @see https://markdown-it.github.io/
 */
export const MarkdownDocument: React.FC<MarkdownDocumentProps> = ({
  additionalOuterContainerClasses,
  additionalRendererClasses,
  onMakeScrollSource,
  baseUrl,
  markdownContentLines,
  onScroll,
  scrollState,
  onHeightChange,
  disableToc
}) => {
  const rendererRef = useRef<HTMLDivElement | null>(null)
  const [rendererSize, setRendererSize] = useState<DOMRectReadOnly>()
  useResizeObserver(rendererRef.current, (entry) => {
    setRendererSize(entry.contentRect)
  })
  useEffect(() => onHeightChange?.((rendererSize?.height ?? 0) + 1), [rendererSize, onHeightChange])

  const internalDocumentRenderPaneRef = useRef<HTMLDivElement>(null)
  const [internalDocumentRenderPaneSize, setInternalDocumentRenderPaneSize] = useState<DOMRectReadOnly>()
  useResizeObserver(internalDocumentRenderPaneRef.current, (entry) =>
    setInternalDocumentRenderPaneSize(entry.contentRect)
  )

  const newlinesAreBreaks = useApplicationState((state) => state.noteDetails.frontmatter.newlinesAreBreaks)

  const contentLineCount = useMemo(() => markdownContentLines.length, [markdownContentLines])
  const [recalculateLineMarkers, onUserScroll] = useDocumentSyncScrolling(
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
        <DocumentMarkdownRenderer
          outerContainerRef={rendererRef}
          className={`mb-3 ${additionalRendererClasses ?? ''}`}
          markdownContentLines={markdownContentLines}
          onLineMarkerPositionChanged={recalculateLineMarkers}
          baseUrl={baseUrl}
          newlinesAreBreaks={newlinesAreBreaks}
        />
      </div>
      <DocumentTocSidebar
        width={internalDocumentRenderPaneSize?.width ?? 0}
        baseUrl={baseUrl}
        disableToc={disableToc ?? false}
      />
    </div>
  )
}
