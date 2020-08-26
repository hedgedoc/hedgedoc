import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import useResizeObserver from 'use-resize-observer'
import { TocAst } from '../../../external-types/markdown-it-toc-done-right/interface'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { ShowIf } from '../../common/show-if/show-if'
import { LineMarkerPosition, MarkdownRenderer } from '../../markdown-renderer/markdown-renderer'
import { ScrollProps, ScrollState } from '../scroll/scroll-props'
import { findLineMarks } from '../scroll/utils'
import { TableOfContents } from '../table-of-contents/table-of-contents'
import { YAMLMetaData } from '../yaml-metadata/yaml-metadata'

interface DocumentRenderPaneProps {
  content: string
  onMetadataChange: (metaData: YAMLMetaData | undefined) => void
  onFirstHeadingChange: (firstHeading: string | undefined) => void
  wide?: boolean
}

export const DocumentRenderPane: React.FC<DocumentRenderPaneProps & ScrollProps> = ({ content, onMetadataChange, onFirstHeadingChange, wide, scrollState, onScroll, onMakeScrollSource }) => {
  const [tocAst, setTocAst] = useState<TocAst>()
  const renderer = useRef<HTMLDivElement>(null)
  const { width } = useResizeObserver({ ref: renderer })
  const lastScrollPosition = useRef<number>()
  const [lineMarks, setLineMarks] = useState<LineMarkerPosition[]>()

  const realWidth = width || 0

  useEffect(() => {
    if (!renderer.current || !lineMarks || !scrollState) {
      return
    }
    const { lastMarkBefore, firstMarkAfter } = findLineMarks(lineMarks, scrollState.firstLineInView)
    const positionBefore = lastMarkBefore ? lastMarkBefore.position : 0
    const positionAfter = firstMarkAfter ? firstMarkAfter.position : renderer.current.offsetHeight
    const lastMarkBeforeLine = lastMarkBefore ? lastMarkBefore.line : 1
    const firstMarkAfterLine = firstMarkAfter ? firstMarkAfter.line : content.split('\n').length
    const lineCount = firstMarkAfterLine - lastMarkBeforeLine
    const blockHeight = positionAfter - positionBefore
    const lineHeight = blockHeight / lineCount
    const position = positionBefore + (scrollState.firstLineInView - lastMarkBeforeLine) * lineHeight + scrollState.scrolledPercentage / 100 * lineHeight
    const correctedPosition = Math.floor(position)
    if (correctedPosition !== lastScrollPosition.current) {
      lastScrollPosition.current = correctedPosition
      renderer.current.scrollTo({
        top: correctedPosition
      })
    }
  }, [content, lineMarks, scrollState])

  const userScroll = useCallback(() => {
    if (!renderer.current || !lineMarks || !onScroll) {
      return
    }

    const scrollTop = renderer.current.scrollTop

    const lineMarksBeforeScrollTop = lineMarks.filter(lineMark => lineMark.position <= scrollTop)
    if (lineMarksBeforeScrollTop.length === 0) {
      return
    }

    const lineMarksAfterScrollTop = lineMarks.filter(lineMark => lineMark.position > scrollTop)
    if (lineMarksAfterScrollTop.length === 0) {
      return
    }

    const beforeLineMark = lineMarksBeforeScrollTop
      .reduce((prevLineMark, currentLineMark) =>
        prevLineMark.line >= currentLineMark.line ? prevLineMark : currentLineMark)

    const afterLineMark = lineMarksAfterScrollTop
      .reduce((prevLineMark, currentLineMark) =>
        prevLineMark.line < currentLineMark.line ? prevLineMark : currentLineMark)

    const blockHeight = afterLineMark.position - beforeLineMark.position
    const distanceToBefore = scrollTop - beforeLineMark.position
    const percentageRaw = (distanceToBefore / blockHeight)
    const percentage = Math.floor(percentageRaw * 100)
    const newScrollState: ScrollState = { firstLineInView: beforeLineMark.line, scrolledPercentage: percentage }
    onScroll(newScrollState)
  }, [lineMarks, onScroll])

  return (
    <div className={'bg-light flex-fill pb-5 flex-row d-flex w-100 h-100 overflow-y-scroll'}
      ref={renderer} onScroll={userScroll} onMouseEnter={onMakeScrollSource}>
      <div className={'col-md'}/>
      <MarkdownRenderer
        className={'flex-fill mb-3'}
        content={content}
        wide={wide}
        onTocChange={(tocAst) => setTocAst(tocAst)}
        onMetaDataChange={onMetadataChange}
        onFirstHeadingChange={onFirstHeadingChange}
        onLineMarkerPositionChanged={setLineMarks}
      />

      <div className={'col-md'}>
        <ShowIf condition={realWidth >= 1280 && !!tocAst}>
          <TableOfContents ast={tocAst as TocAst} className={'position-fixed'}/>
        </ShowIf>
        <ShowIf condition={realWidth < 1280 && !!tocAst}>
          <div className={'markdown-toc-sidebar-button'}>
            <Dropdown drop={'up'}>
              <Dropdown.Toggle id="toc-overlay-button" variant={'secondary'} className={'no-arrow'}>
                <ForkAwesomeIcon icon={'bars'}/>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <div className={'p-2'}>
                  <TableOfContents ast={tocAst as TocAst}/>
                </div>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </ShowIf>
      </div>
    </div>
  )
}
