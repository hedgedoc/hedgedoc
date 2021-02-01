/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TocAst } from 'markdown-it-toc-done-right'
import React, { Fragment, ReactElement, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ShowIf } from '../../common/show-if/show-if'
import { createJumpToMarkClickEventHandler } from '../../markdown-renderer/replace-components/link-replacer/link-replacer'
import './table-of-contents.scss'

export interface TableOfContentsProps {
  ast: TocAst
  maxDepth?: number
  className?: string
  baseUrl?: string
}

export const slugify = (content: string): string => {
  return encodeURIComponent(content.trim().toLowerCase().replace(/\s+/g, '-'))
}

const convertLevel = (toc: TocAst, levelsToShowUnderThis: number, headerCounts: Map<string, number>,
                      wrapInListItem: boolean, baseUrl?: string): ReactElement | null => {
  if (levelsToShowUnderThis < 0) {
    return null
  }

  const rawName = toc.n.trim()
  const nameCount = (headerCounts.get(rawName) ?? -1) + 1
  const slug = `#${slugify(rawName)}${nameCount > 0 ? `-${nameCount}` : ''}`
  const headlineUrl = new URL(slug, baseUrl).toString()

  headerCounts.set(rawName, nameCount)

  const content = (
    <Fragment>
      <ShowIf condition={toc.l > 0}>
        <a href={headlineUrl} title={rawName} onClick={createJumpToMarkClickEventHandler(slug.substr(1))}>{rawName}</a>
      </ShowIf>
      <ShowIf condition={toc.c.length > 0}>
        <ul>
          {
            toc.c.map(child =>
              (convertLevel(child, levelsToShowUnderThis - 1, headerCounts, true, baseUrl)))
          }
        </ul>
      </ShowIf>
    </Fragment>
  )

  if (wrapInListItem) {
    return (
      <li key={headlineUrl}>
        {content}
      </li>
    )
  } else {
    return content
  }
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
                                                                  ast,
                                                                  maxDepth = 3,
                                                                  className,
                                                                  baseUrl
                                                                }) => {
  useTranslation()
  const tocTree = useMemo(() => convertLevel(ast, maxDepth, new Map<string, number>(), false, baseUrl), [ast, maxDepth, baseUrl])

  return (
    <div className={`markdown-toc ${className ?? ''}`}>
      <ShowIf condition={ast.c.length === 0}>
        <Trans i18nKey={'editor.infoToc'}/>
      </ShowIf>
      {tocTree}
    </div>
  )
}
