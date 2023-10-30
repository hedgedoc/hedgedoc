/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JumpAnchor } from '../../markdown-renderer/extensions/link-replacer/jump-anchor'
import { tocSlugify } from './toc-slugify'
import type { TocAst } from '@hedgedoc/markdown-it-plugins'
import type { ReactElement } from 'react'
import React, { Fragment, useMemo } from 'react'

/**
 * Generates a React DOM part for the table of contents from the given AST of the document.
 *
 * @param toc The abstract syntax tree of the document for TOC generation
 * @param levelsToShowUnderThis The amount of levels which should be shown below this TOC item
 * @param headerCounts Map that contains the number of occurrences of single header names to allow suffixing them with a number to make them distinguishable
 * @param baseUrl The base URL used for generating absolute links to the note with the correct slug anchor
 */
const buildReactDomFromTocAst = (
  toc: TocAst,
  levelsToShowUnderThis: number,
  headerCounts: Map<string, number>,
  baseUrl: string
): ReactElement | null => {
  if (levelsToShowUnderThis < 0) {
    return null
  }

  const rawName = toc.name.trim()
  const nameCount = (headerCounts.get(rawName) ?? -1) + 1
  const slug = `#${tocSlugify(rawName)}${nameCount > 0 ? `-${nameCount}` : ''}`
  const headlineUrl = new URL(slug, baseUrl).toString()

  headerCounts.set(rawName, nameCount)

  const children = toc.children
    .map((child) => buildReactDomFromTocAst(child, levelsToShowUnderThis - 1, headerCounts, baseUrl))
    .filter((value) => !!value)
    .map((child, index) => <li key={index}>{child}</li>)

  return (
    <Fragment>
      {toc.level > 0 && (
        <JumpAnchor href={headlineUrl} title={rawName} jumpTargetId={slug.slice(1)}>
          {rawName}
        </JumpAnchor>
      )}
      {children.length > 0 && <ul>{children}</ul>}
    </Fragment>
  )
}

/**
 * Generates a React DOM part for the table of contents from the given AST of the document.
 *
 * @param toc The abstract syntax tree of the document for TOC generation
 * @param maxDepth The maximum depth of levels which should be shown in the TOC
 * @param baseUrl The base URL used for generating absolute links to the note with the correct slug anchor
 */
export const useBuildReactDomFromTocAst = (toc: TocAst, maxDepth: number, baseUrl: string) => {
  return useMemo(
    () => buildReactDomFromTocAst(toc, maxDepth, new Map<string, number>(), baseUrl),
    [toc, maxDepth, baseUrl]
  )
}
