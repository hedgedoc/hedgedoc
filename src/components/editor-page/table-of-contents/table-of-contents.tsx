/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { TocAst } from 'markdown-it-toc-done-right'
import React, { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ShowIf } from '../../common/show-if/show-if'
import { buildReactDomFromTocAst } from './build-react-dom-from-toc-ast'
import styles from './table-of-contents.module.scss'

export interface TableOfContentsProps {
  ast: TocAst
  maxDepth?: number
  className?: string
  baseUrl?: string
}

/**
 * Renders the table of contents for the note.
 *
 * @param ast The ast of the headings in the current note.
 * @param maxDepth The maximal depth of that is considered in the tree
 * @param className Additional classes directly given to the div
 * @param baseUrl The base url of the instance.
 */
export const TableOfContents: React.FC<TableOfContentsProps> = ({ ast, maxDepth = 3, className, baseUrl }) => {
  useTranslation()
  const tocTree = useMemo(
    () => buildReactDomFromTocAst(ast, maxDepth, new Map<string, number>(), false, baseUrl),
    [ast, maxDepth, baseUrl]
  )

  return (
    <div className={`${styles['markdown-toc']} ${className ?? ''}`}>
      <ShowIf condition={ast.c.length === 0}>
        <Trans i18nKey={'editor.infoToc'} />
      </ShowIf>
      {tocTree}
    </div>
  )
}
