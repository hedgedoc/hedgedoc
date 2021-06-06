/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TocAst } from 'markdown-it-toc-done-right'
import React, { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import useResizeObserver from 'use-resize-observer'
import { ForkAwesomeIcon } from '../common/fork-awesome/fork-awesome-icon'
import { ShowIf } from '../common/show-if/show-if'
import { NoteFrontmatter } from '../editor-page/note-frontmatter/note-frontmatter'
import { YamlArrayDeprecationAlert } from '../editor-page/renderer-pane/yaml-array-deprecation-alert'
import { useSyncedScrolling } from '../editor-page/synced-scroll/hooks/use-synced-scrolling'
import { ScrollProps } from '../editor-page/synced-scroll/scroll-props'
import { TableOfContents } from '../editor-page/table-of-contents/table-of-contents'
import { BasicMarkdownRenderer } from '../markdown-renderer/basic-markdown-renderer'
import { ImageClickHandler } from '../markdown-renderer/replace-components/image/image-replacer'
import './markdown-document.scss'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../redux'

export interface RendererProps extends ScrollProps {
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
  onFrontmatterChange?: (frontmatter: NoteFrontmatter | undefined) => void
  onTaskCheckedChange?: (lineInMarkdown: number, checked: boolean) => void
  documentRenderPaneRef?: MutableRefObject<HTMLDivElement | null>
  markdownContent: string
  baseUrl?: string
  onImageClick?: ImageClickHandler
  onHeightChange?: (height: number) => void
  disableToc?: boolean
}

export interface MarkdownDocumentProps extends RendererProps {
  additionalOuterContainerClasses?: string
  additionalRendererClasses?: string
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

  const useAlternativeBreaks = useSelector((state: ApplicationState) => state.noteDetails.frontmatter.breaks)

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
          <ShowIf condition={containerWidth >= 1100}>
            <TableOfContents ast={tocAst as TocAst} className={'sticky'} baseUrl={baseUrl} />
          </ShowIf>
          <ShowIf condition={containerWidth < 1100}>
            <div className={'markdown-toc-sidebar-button'}>
              <Dropdown drop={'up'}>
                <Dropdown.Toggle id='toc-overlay-button' variant={'secondary'} className={'no-arrow'}>
                  <ForkAwesomeIcon icon={'list-ol'} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <div className={'p-2'}>
                    <TableOfContents ast={tocAst as TocAst} baseUrl={baseUrl} />
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
