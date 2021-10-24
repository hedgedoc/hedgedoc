/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Element } from 'domhandler'
import { isTag } from 'domhandler'
import type MarkdownIt from 'markdown-it'
import mathJax from 'markdown-it-mathjax'
import React from 'react'
import { ComponentReplacer } from '../component-replacer'
import './katex.scss'

/**
 * Checks if the given node is a KaTeX block.
 *
 * @param node the node to check
 * @return The given node if it is a KaTeX block element, undefined otherwise.
 */
const getNodeIfKatexBlock = (node: Element): Element | undefined => {
  if (node.name !== 'p' || !node.children || node.children.length === 0) {
    return
  }
  return node.children.filter(isTag).find((subnode) => {
    return subnode.name === 'app-katex' && subnode.attribs?.inline === undefined
  })
}

/**
 * Checks if the given node is a KaTeX inline element.
 *
 * @param node the node to check
 * @return The given node if it is a KaTeX inline element, undefined otherwise.
 */
const getNodeIfInlineKatex = (node: Element): Element | undefined => {
  return node.name === 'app-katex' && node.attribs?.inline !== undefined ? node : undefined
}

const KaTeX = React.lazy(() => import(/* webpackChunkName: "katex" */ '@matejmazur/react-katex'))

/**
 * Detects LaTeX syntax and renders it with KaTeX.
 */
export class KatexReplacer extends ComponentReplacer {
  public static readonly markdownItPlugin: MarkdownIt.PluginSimple = mathJax({
    beforeMath: '<app-katex>',
    afterMath: '</app-katex>',
    beforeInlineMath: '<app-katex inline>',
    afterInlineMath: '</app-katex>',
    beforeDisplayMath: '<app-katex>',
    afterDisplayMath: '</app-katex>'
  })

  public replace(node: Element): React.ReactElement | undefined {
    const katex = getNodeIfKatexBlock(node) || getNodeIfInlineKatex(node)
    if (katex?.children && katex.children[0]) {
      const mathJaxContent = ComponentReplacer.extractTextChildContent(katex)
      const isInline = katex.attribs?.inline !== undefined
      return <KaTeX block={!isInline} math={mathJaxContent} errorColor={'#cc0000'} />
    }
  }
}
