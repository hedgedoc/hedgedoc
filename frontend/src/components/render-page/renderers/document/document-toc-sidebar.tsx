/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TableOfContentsMarkdownExtension } from '../../../../extensions/essential-app-extensions/table-of-contents/table-of-contents-markdown-extension'
import { useExtensionEventEmitterHandler } from '../../../markdown-renderer/hooks/use-extension-event-emitter'
import styles from './markdown-document.module.scss'
import { WidthBasedTableOfContents } from './width-based-table-of-contents'
import type { TocAst } from '@hedgedoc/markdown-it-plugins'
import React, { useState } from 'react'

export interface DocumentTocSidebarProps {
  width: number
}

export const DocumentTocSidebar: React.FC<DocumentTocSidebarProps> = ({ width }) => {
  const [tocAst, setTocAst] = useState<TocAst>()
  useExtensionEventEmitterHandler(TableOfContentsMarkdownExtension.EVENT_NAME, setTocAst)

  return (
    <div className={styles.side}>
      {tocAst !== undefined && <WidthBasedTableOfContents tocAst={tocAst} width={width} />}
    </div>
  )
}
