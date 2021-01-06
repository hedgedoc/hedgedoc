/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../redux'
import { LineMarkerPosition } from '../../markdown-renderer/types'
import { useScrollToLineMark } from '../scroll/hooks/use-scroll-to-line-mark'
import { useUserScroll } from '../scroll/hooks/use-user-scroll'
import { ScrollProps } from '../scroll/scroll-props'
import { DocumentRenderPane, DocumentRenderPaneProps } from './document-render-pane'

export const ScrollingDocumentRenderPane: React.FC<DocumentRenderPaneProps & ScrollProps> = ({
  scrollState,
  wide,
  onFirstHeadingChange,
  onMakeScrollSource,
  onMetadataChange,
  onScroll,
  onTaskCheckedChange
}) => {
  const markdownContent = useSelector((state: ApplicationState) => state.documentContent.content)
  const renderer = useRef<HTMLDivElement>(null)
  const [lineMarks, setLineMarks] = useState<LineMarkerPosition[]>()

  const contentLineCount = useMemo(() => markdownContent.split('\n').length, [markdownContent])
  useScrollToLineMark(scrollState, lineMarks, contentLineCount, renderer)
  const userScroll = useUserScroll(lineMarks, renderer, onScroll)

  return (
    <DocumentRenderPane
      extraClasses={'overflow-y-scroll'}
      rendererReference={renderer}
      wide={wide}
      onFirstHeadingChange={onFirstHeadingChange}
      onLineMarkerPositionChanged={setLineMarks}
      onMetadataChange={onMetadataChange}
      onMouseEnterRenderer={onMakeScrollSource}
      onScrollRenderer={userScroll}
      onTaskCheckedChange={onTaskCheckedChange}
    />
  )
}
