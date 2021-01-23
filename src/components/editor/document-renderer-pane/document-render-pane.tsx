/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TocAst } from 'markdown-it-toc-done-right'
import React, { RefObject, useRef, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import useResizeObserver from 'use-resize-observer'
import { ApplicationState } from '../../../redux'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { ShowIf } from '../../common/show-if/show-if'
import { FullMarkdownRenderer } from '../../markdown-renderer/full-markdown-renderer'
import { LineMarkerPosition } from '../../markdown-renderer/types'
import { TableOfContents } from '../table-of-contents/table-of-contents'
import { YAMLMetaData } from '../yaml-metadata/yaml-metadata'
import { useAdaptedLineMarkerCallback } from './use-adapted-line-markers-callback'
import { YamlArrayDeprecationAlert } from './yaml-array-deprecation-alert'

export interface DocumentRenderPaneProps {
  extraClasses?: string
  onFirstHeadingChange: (firstHeading: string | undefined) => void
  onLineMarkerPositionChanged?: (lineMarkerPosition: LineMarkerPosition[]) => void
  onMetadataChange: (metaData: YAMLMetaData | undefined) => void
  onMouseEnterRenderer?: () => void
  onScrollRenderer?: () => void
  onTaskCheckedChange: (lineInMarkdown: number, checked: boolean) => void
  documentRenderPaneRef?: RefObject<HTMLDivElement>
  wide?: boolean
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
    wide
  }) => {
  const [tocAst, setTocAst] = useState<TocAst>()
  const { width } = useResizeObserver(documentRenderPaneRef ? { ref: documentRenderPaneRef } : undefined)
  const realWidth = width || 0
  const rendererRef = useRef<HTMLDivElement | null>(null)
  const markdownContent = useSelector((state: ApplicationState) => state.documentContent.content)
  const changeLineMarker = useAdaptedLineMarkerCallback(documentRenderPaneRef, rendererRef, onLineMarkerPositionChanged)

  return (
    <div className={`bg-light flex-fill pb-5 flex-row d-flex w-100 h-100 ${extraClasses ?? ''}`}
         ref={documentRenderPaneRef} onScroll={onScrollRenderer} onMouseEnter={onMouseEnterRenderer}>
      <div className={'col-md'}/>
      <div className={'bg-light flex-fill'}>
        <YamlArrayDeprecationAlert/>
        <div>
          <FullMarkdownRenderer
            rendererRef={rendererRef}
            className={'flex-fill mb-3'}
            content={markdownContent}
            onFirstHeadingChange={onFirstHeadingChange}
            onLineMarkerPositionChanged={changeLineMarker}
            onMetaDataChange={onMetadataChange}
            onTaskCheckedChange={onTaskCheckedChange}
            onTocChange={(tocAst) => setTocAst(tocAst)}
            wide={wide}
          />
        </div>
      </div>

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
