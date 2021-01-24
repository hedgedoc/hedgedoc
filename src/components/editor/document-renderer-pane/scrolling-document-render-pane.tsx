/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo, useRef, useState } from 'react'
import { LineMarkerPosition } from '../../markdown-renderer/types'
import { useOnUserScroll } from '../scroll/hooks/use-on-user-scroll'
import { useScrollToLineMark } from '../scroll/hooks/use-scroll-to-line-mark'
import { ScrollProps } from '../scroll/scroll-props'
import { DocumentRenderPane, DocumentRenderPaneProps } from './document-render-pane'

type ImplementedProps =
  'onLineMarkerPositionChanged'
  | 'onScrollRenderer'
  | 'rendererReference'
  | 'onMouseEnterRenderer'

export type ScrollingDocumentRenderPaneProps = Omit<(DocumentRenderPaneProps & ScrollProps), ImplementedProps>

export const ScrollingDocumentRenderPane: React.FC<ScrollingDocumentRenderPaneProps> = (
  {
    scrollState,
    wide,
    onFirstHeadingChange,
    onMakeScrollSource,
    onMetadataChange,
    onScroll,
    onTaskCheckedChange,
    markdownContent,
    extraClasses,
    baseUrl,
    onImageClick
  }) => {
  const renderer = useRef<HTMLDivElement>(null)
  const [lineMarks, setLineMarks] = useState<LineMarkerPosition[]>()

  const contentLineCount = useMemo(() => markdownContent.split('\n').length, [markdownContent])
  useScrollToLineMark(scrollState, lineMarks, contentLineCount, renderer)
  const userScroll = useOnUserScroll(lineMarks, renderer, onScroll)

  return (
    <DocumentRenderPane
      extraClasses={`overflow-y-scroll h-100 ${extraClasses || ''}`}
      documentRenderPaneRef={renderer}
      wide={wide}
      onFirstHeadingChange={onFirstHeadingChange}
      onLineMarkerPositionChanged={setLineMarks}
      onMetadataChange={onMetadataChange}
      onMouseEnterRenderer={onMakeScrollSource}
      onScrollRenderer={userScroll}
      onTaskCheckedChange={onTaskCheckedChange}
      markdownContent={markdownContent}
      baseUrl={baseUrl}
      onImageClick={onImageClick}
    />
  )
}
