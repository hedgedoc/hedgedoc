/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Element } from 'domhandler'
import { isTag } from 'domhandler'
import React from 'react'
import { ComponentReplacer, DO_NOT_REPLACE } from '../../replace-components/component-replacer'
import 'katex/dist/katex.min.css'
import { KatexMarkdownExtension } from './katex-markdown-extension'

/**
 * Checks if the given node is a KaTeX block.
 *
 * @param node the node to check
 * @return The given node if it is a KaTeX block element, {@link undefined} otherwise.
 */
const containsKatexBlock = (node: Element): Element | undefined => {
  if (node.name !== 'p' || !node.children || node.children.length === 0) {
    return
  }
  return node.children.filter(isTag).find((subnode) => {
    return isKatexTag(subnode, false) ? subnode : undefined
  })
}

/**
 * Checks if the given node is a KaTeX element.
 *
 * @param node the node to check
 * @param expectedInline defines if the found katex element is expected to be an inline or block element.
 * @return {@link true} if the given node is a katex element.
 */
const isKatexTag = (node: Element, expectedInline: boolean) => {
  return (
    node.name === KatexMarkdownExtension.tagName && (node.attribs?.['data-inline'] !== undefined) === expectedInline
  )
}

const KaTeX = React.lazy(() => import(/* webpackChunkName: "katex" */ '@matejmazur/react-katex'))

/**
 * Detects LaTeX syntax and renders it with KaTeX.
 */
export class KatexReplacer extends ComponentReplacer {
  public replace(node: Element): React.ReactElement | undefined {
    if (!(isKatexTag(node, true) || containsKatexBlock(node)) || node.children?.[0] === undefined) {
      return DO_NOT_REPLACE
    }
    const latexContent = ComponentReplacer.extractTextChildContent(node)
    const isInline = !!node.attribs?.['data-inline']
    return <KaTeX block={!isInline} math={latexContent} errorColor={'#cc0000'} />
  }
}
