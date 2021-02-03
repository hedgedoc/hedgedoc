/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TocAst } from 'markdown-it-toc-done-right'
import React, { MutableRefObject, useMemo, useRef, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import useResizeObserver from 'use-resize-observer'
import { ForkAwesomeIcon } from '../common/fork-awesome/fork-awesome-icon'
import { ShowIf } from '../common/show-if/show-if'
import { NoteFrontmatter } from '../editor-page/note-frontmatter/note-frontmatter'
import { YamlArrayDeprecationAlert } from '../editor-page/renderer-pane/yaml-array-deprecation-alert'
import { useSyncedScrolling } from '../editor-page/synced-scroll/hooks/use-synced-scrolling'
import { ScrollProps } from '../editor-page/synced-scroll/scroll-props'
import { TableOfContents } from '../editor-page/table-of-contents/table-of-contents'
import { FullMarkdownRenderer } from '../markdown-renderer/full-markdown-renderer'
import { ImageClickHandler } from '../markdown-renderer/replace-components/image/image-replacer'
import './markdown-document.scss'

export interface MarkdownDocumentProps extends ScrollProps {
  extraClasses?: string
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
  onFrontmatterChange?: (frontmatter: NoteFrontmatter | undefined) => void
  onTaskCheckedChange?: (lineInMarkdown: number, checked: boolean) => void
  documentRenderPaneRef?: MutableRefObject<HTMLDivElement | null>
  markdownContent: string,
  baseUrl?: string
  onImageClick?: ImageClickHandler
}

export const MarkdownDocument: React.FC<MarkdownDocumentProps> = (
  {
    extraClasses,
    onFirstHeadingChange,
    onFrontmatterChange,
    onMakeScrollSource,
    onTaskCheckedChange,
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
    <div className={ `markdown-document ${ extraClasses ?? '' }` }
         ref={ internalDocumentRenderPaneRef } onScroll={ onUserScroll } onMouseEnter={ onMakeScrollSource }>
      <div className={ 'markdown-document-side' }/>
      <div className={ 'bg-light markdown-document-content' }>
        <YamlArrayDeprecationAlert/>
        <FullMarkdownRenderer
          rendererRef={ rendererRef }
          className={ 'flex-fill pt-4 mb-3' }
          content={ markdownContent }
          onFirstHeadingChange={ onFirstHeadingChange }
          onLineMarkerPositionChanged={ onLineMarkerPositionChanged }
          onFrontmatterChange={ onFrontmatterChange }
          onTaskCheckedChange={ onTaskCheckedChange }
          onTocChange={ (tocAst) => setTocAst(tocAst) }
          baseUrl={ baseUrl }
          onImageClick={ onImageClick }/>

      </div>

      <div className={ 'markdown-document-side pt-4' }>
        <ShowIf condition={ !!tocAst }>
          <ShowIf condition={ width >= 1100 }>
            <TableOfContents ast={ tocAst as TocAst } className={ 'sticky' } baseUrl={ baseUrl }/>
          </ShowIf>
          <ShowIf condition={ width < 1100 }>
            <div className={ 'markdown-toc-sidebar-button' }>
              <Dropdown drop={ 'up' }>
                <Dropdown.Toggle id="toc-overlay-button" variant={ 'secondary' } className={ 'no-arrow' }>
                  <ForkAwesomeIcon icon={ 'list-ol' }/>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <div className={ 'p-2' }>
                    <TableOfContents ast={ tocAst as TocAst } baseUrl={ baseUrl }/>
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
