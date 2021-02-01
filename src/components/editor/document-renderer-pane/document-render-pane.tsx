/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TocAst } from 'markdown-it-toc-done-right'
import React, { MutableRefObject, useMemo, useRef, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import useResizeObserver from 'use-resize-observer'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { ShowIf } from '../../common/show-if/show-if'
import { FullMarkdownRenderer } from '../../markdown-renderer/full-markdown-renderer'
import { ImageClickHandler } from '../../markdown-renderer/replace-components/image/image-replacer'
import { NoteFrontmatter } from '../note-frontmatter/note-frontmatter'
import { ScrollProps } from '../scroll/scroll-props'
import { TableOfContents } from '../table-of-contents/table-of-contents'
import { useSyncedScrolling } from './hooks/use-synced-scrolling'
import { YamlArrayDeprecationAlert } from './yaml-array-deprecation-alert'

export interface DocumentRenderPaneProps extends ScrollProps {
  extraClasses?: string
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
  onFrontmatterChange?: (frontmatter: NoteFrontmatter | undefined) => void
  onTaskCheckedChange?: (lineInMarkdown: number, checked: boolean) => void
  documentRenderPaneRef?: MutableRefObject<HTMLDivElement | null>
  wide?: boolean,
  markdownContent: string,
  baseUrl?: string
  onImageClick?: ImageClickHandler
}

export const DocumentRenderPane: React.FC<DocumentRenderPaneProps> = (
  {
    extraClasses,
    onFirstHeadingChange,
    onFrontmatterChange,
    onMakeScrollSource,
    onTaskCheckedChange,
    wide,
    baseUrl,
    markdownContent,
    onImageClick,
    onScroll,
    scrollState
  }) => {
  const rendererRef = useRef<HTMLDivElement | null>(null)
  const internalDocumentRenderPaneRef = useRef<HTMLDivElement>(null)
  const [tocAst, setTocAst] = useState<TocAst>()
  const width = useResizeObserver({ ref: internalDocumentRenderPaneRef.current }).width ?? 0

  const contentLineCount = useMemo(() => markdownContent.split('\n').length, [markdownContent])
  const [onLineMarkerPositionChanged, onUserScroll] = useSyncedScrolling(internalDocumentRenderPaneRef, rendererRef, contentLineCount, scrollState, onScroll)

  return (
    <div className={`overflow-y-scroll h-100 bg-light m-0 pb-5 row ${extraClasses ?? ''}`}
         ref={internalDocumentRenderPaneRef} onScroll={onUserScroll} onMouseEnter={onMakeScrollSource}>
      <div className={'col-md d-none d-md-block'}/>
      <div className={'bg-light col'}>
        <YamlArrayDeprecationAlert/>
        <div>
          <FullMarkdownRenderer
            rendererRef={rendererRef}
            className={'flex-fill pt-4 mb-3'}
            content={markdownContent}
            onFirstHeadingChange={onFirstHeadingChange}
            onLineMarkerPositionChanged={onLineMarkerPositionChanged}
            onFrontmatterChange={onFrontmatterChange}
            onTaskCheckedChange={onTaskCheckedChange}
            onTocChange={(tocAst) => setTocAst(tocAst)}
            wide={wide}
            baseUrl={baseUrl}
            onImageClick={onImageClick}/>
        </div>
      </div>

      <div className={'col-md pt-4'}>
        <ShowIf condition={!!tocAst}>
          <ShowIf condition={width >= 1280}>
            <TableOfContents ast={tocAst as TocAst} className={'sticky'} baseUrl={baseUrl}/>
          </ShowIf>
          <ShowIf condition={width < 1280}>
            <div className={'markdown-toc-sidebar-button'}>
              <Dropdown drop={'up'}>
                <Dropdown.Toggle id="toc-overlay-button" variant={'secondary'} className={'no-arrow'}>
                  <ForkAwesomeIcon icon={'list-ol'}/>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <div className={'p-2'}>
                    <TableOfContents ast={tocAst as TocAst} baseUrl={baseUrl}/>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </ShowIf>
        </ShowIf>
      </div>
    </div>
  )
}
