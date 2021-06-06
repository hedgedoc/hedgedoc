/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TocAst } from 'markdown-it-toc-done-right'
import React, { Fragment, ReactElement } from 'react'
import { ShowIf } from '../../common/show-if/show-if'
import { createJumpToMarkClickEventHandler } from '../../markdown-renderer/replace-components/link-replacer/link-replacer'
import { tocSlugify } from './toc-slugify'

export const buildReactDomFromTocAst = (
  toc: TocAst,
  levelsToShowUnderThis: number,
  headerCounts: Map<string, number>,
  wrapInListItem: boolean,
  baseUrl?: string
): ReactElement | null => {
  if (levelsToShowUnderThis < 0) {
    return null
  }

  const rawName = toc.n.trim()
  const nameCount = (headerCounts.get(rawName) ?? -1) + 1
  const slug = `#${tocSlugify(rawName)}${nameCount > 0 ? `-${nameCount}` : ''}`
  const headlineUrl = new URL(slug, baseUrl).toString()

  headerCounts.set(rawName, nameCount)

  const content = (
    <Fragment>
      <ShowIf condition={toc.l > 0}>
        <a href={headlineUrl} title={rawName} onClick={createJumpToMarkClickEventHandler(slug.substr(1))}>
          {rawName}
        </a>
      </ShowIf>
      <ShowIf condition={toc.c.length > 0}>
        <ul>
          {toc.c.map((child) => buildReactDomFromTocAst(child, levelsToShowUnderThis - 1, headerCounts, true, baseUrl))}
        </ul>
      </ShowIf>
    </Fragment>
  )

  if (wrapInListItem) {
    return <li key={headlineUrl}>{content}</li>
  } else {
    return content
  }
}
