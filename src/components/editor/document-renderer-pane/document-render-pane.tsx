/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TocAst } from 'markdown-it-toc-done-right'
import React, { MutableRefObject, useCallback, useRef, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import useResizeObserver from 'use-resize-observer'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { ShowIf } from '../../common/show-if/show-if'
import { FullMarkdownRenderer } from '../../markdown-renderer/full-markdown-renderer'
import { ImageClickHandler } from '../../markdown-renderer/replace-components/image/image-replacer'
import { LineMarkerPosition } from '../../markdown-renderer/types'
import { TableOfContents } from '../table-of-contents/table-of-contents'
import { YAMLMetaData } from '../yaml-metadata/yaml-metadata'
import { useAdaptedLineMarkerCallback } from './use-adapted-line-markers-callback'
import { YamlArrayDeprecationAlert } from './yaml-array-deprecation-alert'

export interface DocumentRenderPaneProps {
  extraClasses?: string
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
  onLineMarkerPositionChanged?: (lineMarkerPosition: LineMarkerPosition[]) => void
  onMetadataChange?: (metaData: YAMLMetaData | undefined) => void
  onMouseEnterRenderer?: () => void
  onScrollRenderer?: () => void
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
    onLineMarkerPositionChanged,
    onMetadataChange,
    onMouseEnterRenderer,
    onScrollRenderer,
    onTaskCheckedChange,
    documentRenderPaneRef,
    wide,
    baseUrl,
    markdownContent,
    onImageClick
  }) => {
  const [tocAst, setTocAst] = useState<TocAst>()
  const internalDocumentRenderPaneRef = useRef<HTMLDivElement>()
  const { width } = useResizeObserver({ ref: internalDocumentRenderPaneRef.current })
  const realWidth = width || 0
  const rendererRef = useRef<HTMLDivElement | null>(null)
  const changeLineMarker = useAdaptedLineMarkerCallback(documentRenderPaneRef, rendererRef, onLineMarkerPositionChanged)
  const setContainerReference = useCallback((instance: HTMLDivElement | null) => {
    if (documentRenderPaneRef) {
      documentRenderPaneRef.current = instance || null
    }
    internalDocumentRenderPaneRef.current = instance || undefined
  }, [documentRenderPaneRef])

  return (
    <div className={`bg-light m-0 pb-5 row ${extraClasses ?? ''}`}
         ref={setContainerReference} onScroll={onScrollRenderer} onMouseEnter={onMouseEnterRenderer}>
      <div className={'col-md d-none d-md-block'}/>
      <div className={'bg-light col'}>
        <YamlArrayDeprecationAlert/>
        <div>
          <FullMarkdownRenderer
            rendererRef={rendererRef}
            className={'flex-fill pt-4 mb-3'}
            content={markdownContent}
            onFirstHeadingChange={onFirstHeadingChange}
            onLineMarkerPositionChanged={changeLineMarker}
            onMetaDataChange={onMetadataChange}
            onTaskCheckedChange={onTaskCheckedChange}
            onTocChange={(tocAst) => setTocAst(tocAst)}
            wide={wide}
            baseUrl={baseUrl}
            onImageClick={onImageClick}/>
        </div>
      </div>

      <div className={'col-md pt-4'}>
        <ShowIf condition={realWidth >= 1280 && !!tocAst}>
          <TableOfContents ast={tocAst as TocAst} className={'sticky'} baseUrl={baseUrl}/>
        </ShowIf>
        <ShowIf condition={realWidth < 1280 && !!tocAst}>
          <div className={'markdown-toc-sidebar-button'}>
            <Dropdown drop={'up'}>
              <Dropdown.Toggle id="toc-overlay-button" variant={'secondary'} className={'no-arrow'}>
                <ForkAwesomeIcon icon={'bars'}/>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <div className={'p-2'}>
                  <TableOfContents ast={tocAst as TocAst} baseUrl={baseUrl}/>
                </div>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </ShowIf>
      </div>
    </div>
  )
}
