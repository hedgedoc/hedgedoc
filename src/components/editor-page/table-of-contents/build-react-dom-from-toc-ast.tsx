/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { TocAst } from 'markdown-it-toc-done-right'
import type { ReactElement } from 'react'
import React, { Fragment } from 'react'
import { ShowIf } from '../../common/show-if/show-if'
import { tocSlugify } from './toc-slugify'
import { JumpAnchor } from '../../markdown-renderer/markdown-extension/link-replacer/jump-anchor'

/**
 * Generates a React DOM part for the table of contents from the given AST of the document.
 *
 * @param toc The abstract syntax tree of the document for TOC generation
 * @param levelsToShowUnderThis The amount of levels which should be shown below this TOC item
 * @param headerCounts Map that contains the number of occurrences of single header names to allow suffixing them with a number to make them distinguishable
 * @param wrapInListItem Whether to wrap the TOC content in a list item
 * @param baseUrl The base URL used for generating absolute links to the note with the correct slug anchor
 */
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
        <JumpAnchor href={headlineUrl} title={rawName} jumpTargetId={slug.slice(1)}>
          {rawName}
        </JumpAnchor>
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
