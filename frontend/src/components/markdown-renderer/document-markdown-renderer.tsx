/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../utils/cypress-attribute'
import type { CommonMarkdownRendererProps } from './common-markdown-renderer-props'
import { HeadlineAnchorsMarkdownExtension } from './extensions/headline-anchors-markdown-extension'
import type { LineMarkers } from './extensions/linemarker/add-line-marker-markdown-it-plugin'
import { LinemarkerMarkdownExtension } from './extensions/linemarker/linemarker-markdown-extension'
import type { LineMarkerPosition } from './extensions/linemarker/types'
import { useCalculateLineMarkerPosition } from './hooks/use-calculate-line-marker-positions'
import { useMarkdownExtensions } from './hooks/use-markdown-extensions'
import { MarkdownToReact } from './markdown-to-react/markdown-to-react'
import React, { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export interface DocumentMarkdownRendererProps extends CommonMarkdownRendererProps {
  onLineMarkerPositionChanged?: (lineMarkerPosition: LineMarkerPosition[]) => void
}

/**
 * Renders the note as normal document.
 *
 * @param className Additional class names directly given to the div
 * @param markdownContentLines The markdown lines
 * @param onLineMarkerPositionChanged The callback to call with changed {@link LineMarkers}
 * @param baseUrl The base url of the renderer
 * @param outerContainerRef A reference for the outer container
 * @param newlinesAreBreaks If newlines are rendered as breaks or not
 */
export const DocumentMarkdownRenderer: React.FC<DocumentMarkdownRendererProps> = ({
  className,
  markdownContentLines,
  onLineMarkerPositionChanged,
  baseUrl,
  outerContainerRef,
  newlinesAreBreaks
}) => {
  const markdownBodyRef = useRef<HTMLDivElement>(null)
  const currentLineMarkers = useRef<LineMarkers[]>()

  const extensions = useMarkdownExtensions(
    baseUrl,
    useMemo(
      () => [
        new HeadlineAnchorsMarkdownExtension(),
        new LinemarkerMarkdownExtension((values) => (currentLineMarkers.current = values))
      ],
      []
    )
  )

  useTranslation()
  useCalculateLineMarkerPosition(markdownBodyRef, currentLineMarkers.current, onLineMarkerPositionChanged)

  return (
    <div ref={outerContainerRef} className={`position-relative`}>
      <div
        {...cypressId('markdown-body')}
        ref={markdownBodyRef}
        data-word-count-target={true}
        className={`${className ?? ''} markdown-body w-100 d-flex flex-column align-items-center`}>
        <MarkdownToReact
          markdownContentLines={markdownContentLines}
          markdownRenderExtensions={extensions}
          newlinesAreBreaks={newlinesAreBreaks}
          allowHtml={true}
        />
      </div>
    </div>
  )
}

export default DocumentMarkdownRenderer
