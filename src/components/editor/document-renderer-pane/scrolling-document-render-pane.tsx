import React, { useMemo, useRef, useState } from 'react'
import { LineMarkerPosition } from '../../markdown-renderer/types'
import { useScrollToLineMark } from '../scroll/hooks/use-scroll-to-line-mark'
import { useUserScroll } from '../scroll/hooks/use-user-scroll'
import { ScrollProps } from '../scroll/scroll-props'
import { DocumentRenderPane, DocumentRenderPaneProps } from './document-render-pane'

export const ScrollingDocumentRenderPane: React.FC<DocumentRenderPaneProps & ScrollProps> = ({
  content,
  scrollState,
  wide,
  onFirstHeadingChange,
  onMakeScrollSource,
  onMetadataChange,
  onScroll,
  onTaskCheckedChange
}) => {
  const renderer = useRef<HTMLDivElement>(null)
  const [lineMarks, setLineMarks] = useState<LineMarkerPosition[]>()

  const contentLineCount = useMemo(() => content.split('\n').length, [content])
  useScrollToLineMark(scrollState, lineMarks, contentLineCount, renderer)
  const userScroll = useUserScroll(lineMarks, renderer, onScroll)

  return (
    <DocumentRenderPane
      content={content}
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
