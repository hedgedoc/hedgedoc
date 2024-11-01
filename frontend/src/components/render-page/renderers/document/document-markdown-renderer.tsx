/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../utils/cypress-attribute'
import type { ScrollProps } from '../../../editor-page/synced-scroll/scroll-props'
import { useApplyDarkModeStyle } from '../../../layout/dark-mode/use-apply-dark-mode-style'
import type { LineMarkers } from '../../../markdown-renderer/extensions/linemarker/add-line-marker-markdown-it-plugin'
import { LinemarkerMarkdownExtension } from '../../../markdown-renderer/extensions/linemarker/linemarker-markdown-extension'
import { useCalculateLineMarkerPosition } from '../../../markdown-renderer/hooks/use-calculate-line-marker-positions'
import { useMarkdownExtensions } from '../../../markdown-renderer/hooks/use-markdown-extensions'
import { MarkdownToReact } from '../../../markdown-renderer/markdown-to-react/markdown-to-react'
import { useDocumentSyncScrolling } from '../../hooks/sync-scroll/use-document-sync-scrolling'
import { useOnHeightChange } from '../../hooks/use-on-height-change'
import { useTransparentBodyBackground } from '../../hooks/use-transparent-body-background'
import { RendererType } from '../../window-post-message-communicator/rendering-message'
import type { CommonMarkdownRendererProps, HeightChangeRendererProps } from '../common-markdown-renderer-props'
import { DocumentTocSidebar } from './document-toc-sidebar'
import styles from './markdown-document.module.scss'
import useResizeObserver from '@react-hook/resize-observer'
import React, { useMemo, useRef, useState } from 'react'

export type DocumentMarkdownRendererProps = CommonMarkdownRendererProps & ScrollProps & HeightChangeRendererProps

/**
 * Renders a Markdown document and handles scrolling, yaml metadata and a floating table of contents.
 *
 * @param onMakeScrollSource The callback to call if a change of the scroll source is requested-
 * @param baseUrl The base url for the renderer
 * @param markdownContentLines The current content of the Markdown document.
 * @param onScroll The callback to call if the renderer is scrolling.
 * @param scrollState The current {@link ScrollState}
 * @param onHeightChange The callback to call if the height of the document changes
 * @param newlinesAreBreaks Defines if the provided markdown content should treat new lines as breaks
 */
export const DocumentMarkdownRenderer: React.FC<DocumentMarkdownRendererProps> = ({
  onMakeScrollSource,
  baseUrl,
  markdownContentLines,
  onScroll,
  scrollState,
  onHeightChange,
  newLinesAreBreaks
}) => {
  const rendererRef = useRef<HTMLDivElement | null>(null)
  useOnHeightChange(rendererRef, onHeightChange)

  const internalDocumentRenderPaneRef = useRef<HTMLDivElement>(null)
  const [internalDocumentRenderPaneSize, setInternalDocumentRenderPaneSize] = useState<DOMRectReadOnly>()
  useResizeObserver(internalDocumentRenderPaneRef.current, (entry) =>
    setInternalDocumentRenderPaneSize(entry.contentRect)
  )

  const contentLineCount = useMemo(() => markdownContentLines.length, [markdownContentLines])
  const [recalculateLineMarkers, onUserScroll] = useDocumentSyncScrolling(
    internalDocumentRenderPaneRef,
    rendererRef,
    contentLineCount,
    scrollState ?? null,
    onScroll ?? null
  )

  const markdownBodyRef = useRef<HTMLDivElement>(null)
  const currentLineMarkers = useRef<LineMarkers[]>()

  const extensions = useMarkdownExtensions(
    baseUrl,
    RendererType.DOCUMENT,
    useMemo(() => [new LinemarkerMarkdownExtension((values) => (currentLineMarkers.current = values))], [])
  )
  useCalculateLineMarkerPosition(markdownBodyRef, currentLineMarkers.current, recalculateLineMarkers)

  useTransparentBodyBackground()
  useApplyDarkModeStyle()

  return (
    <div
      className={`vh-100 ${styles.document}`}
      ref={internalDocumentRenderPaneRef}
      onScroll={onUserScroll}
      data-scroll-element={true}
      onMouseEnter={onMakeScrollSource}
      onTouchStart={onMakeScrollSource}>
      <div className={styles.side} />
      <div className={styles.content}>
        <div ref={rendererRef} className={`position-relative`}>
          <div
            {...cypressId('markdown-body')}
            ref={markdownBodyRef}
            data-word-count-target={true}
            className={`mb-3 markdown-body w-100 d-flex flex-column align-items-center`}>
            <MarkdownToReact
              markdownContentLines={markdownContentLines}
              markdownRenderExtensions={extensions}
              newlinesAreBreaks={newLinesAreBreaks}
              allowHtml={true}
            />
          </div>
        </div>
      </div>
      <DocumentTocSidebar width={internalDocumentRenderPaneSize?.width ?? 0} />
    </div>
  )
}
