/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { concatCssClasses } from '../../../utils/concat-css-classes'
import styles from './table-of-contents.module.scss'
import { useBuildReactDomFromTocAst } from './use-build-react-dom-from-toc-ast'
import type { TocAst } from '@hedgedoc/markdown-it-plugins'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

export interface TableOfContentsProps {
  ast: TocAst
  maxDepth?: number
  className?: string
  baseUrl: string
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
  const tocTree = useBuildReactDomFromTocAst(ast, maxDepth, baseUrl)

  return (
    <div className={concatCssClasses(styles.toc, className)}>
      {ast.children.length === 0 && <Trans i18nKey={'editor.infoToc'} />}
      {tocTree}
    </div>
  )
}
