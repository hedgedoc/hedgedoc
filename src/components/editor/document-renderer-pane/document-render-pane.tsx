import React, { useRef, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import useResizeObserver from 'use-resize-observer'
import { TocAst } from '../../../external-types/markdown-it-toc-done-right/interface'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { ShowIf } from '../../common/show-if/show-if'
import { MarkdownRenderer } from '../../markdown-renderer/markdown-renderer'
import { YAMLMetaData } from '../yaml-metadata/yaml-metadata'
import { TableOfContents } from '../table-of-contents/table-of-contents'

interface DocumentRenderPaneProps {
  content: string
  onMetadataChange: (metaData: YAMLMetaData | undefined) => void
  onFirstHeadingChange: (firstHeading: string | undefined) => void
  wide?: boolean
}

export const DocumentRenderPane: React.FC<DocumentRenderPaneProps> = ({ content, onMetadataChange, onFirstHeadingChange, wide }) => {
  const [tocAst, setTocAst] = useState<TocAst>()
  const renderer = useRef<HTMLDivElement>(null)
  const { width } = useResizeObserver({ ref: renderer })

  const realWidth = width || 0

  return (
    <div className={'bg-light flex-fill pb-5 flex-row d-flex w-100 h-100 overflow-y-scroll'} ref={renderer}>
      <div className={'col-md'}/>
      <MarkdownRenderer
        className={'flex-fill'}
        content={content}
        wide={wide}
        onTocChange={(tocAst) => setTocAst(tocAst)}
        onMetaDataChange={onMetadataChange}
        onFirstHeadingChange={onFirstHeadingChange}
      />

      <div className={'col-md'}>
        <ShowIf condition={realWidth >= 1280 && !!tocAst}>
          <TableOfContents ast={tocAst as TocAst} sticky={true}/>
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
