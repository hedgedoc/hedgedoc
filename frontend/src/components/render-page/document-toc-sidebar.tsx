/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ShowIf } from '../common/show-if/show-if'
import { TableOfContentsMarkdownExtension } from '../markdown-renderer/extensions/table-of-contents-markdown-extension'
import { useExtensionEventEmitterHandler } from '../markdown-renderer/hooks/use-extension-event-emitter'
import styles from './markdown-document.module.scss'
import { WidthBasedTableOfContents } from './width-based-table-of-contents'
import type { TocAst } from 'markdown-it-toc-done-right'
import React, { useState } from 'react'

export interface DocumentTocSidebarProps {
  width: number
  disableToc: boolean
  baseUrl: string
}

export const DocumentTocSidebar: React.FC<DocumentTocSidebarProps> = ({ disableToc, width, baseUrl }) => {
  const [tocAst, setTocAst] = useState<TocAst>()
  useExtensionEventEmitterHandler(TableOfContentsMarkdownExtension.EVENT_NAME, setTocAst)
  return (
    <div className={`${styles['markdown-document-side']} pt-4`}>
      <ShowIf condition={!!tocAst && !disableToc}>
        <WidthBasedTableOfContents tocAst={tocAst as TocAst} baseUrl={baseUrl} width={width} />
      </ShowIf>
    </div>
  )
}
