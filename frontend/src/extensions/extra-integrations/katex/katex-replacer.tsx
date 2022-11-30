/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NodeReplacement } from '../../../components/markdown-renderer/replace-components/component-replacer'
import {
  ComponentReplacer,
  DO_NOT_REPLACE
} from '../../../components/markdown-renderer/replace-components/component-replacer'
import { KatexMarkdownExtension } from './katex-markdown-extension'
import { Optional } from '@mrdrogdrog/optional'
import type { Element } from 'domhandler'
import { isTag } from 'domhandler'
import React from 'react'

const KaTeX = React.lazy(() => import(/* webpackChunkName: "katex" */ './katex-frame'))

/**
 * Detects LaTeX syntax and renders it with KaTeX.
 */
export class KatexReplacer extends ComponentReplacer {
  public replace(node: Element): NodeReplacement {
    return this.extractKatexContent(node)
      .map((latexContent) => {
        const isInline = !!node.attribs?.['data-inline']
        return <KaTeX key={'katex'} block={!isInline} expression={latexContent} />
      })
      .orElse(DO_NOT_REPLACE)
  }

  /**
   * Checks the given node for katex expression tags and extracts the LaTeX code.
   *
   * @param node The node to scan for inline or block tags
   * @return An optional that contains the extracted latex code
   */
  private extractKatexContent(node: Element): Optional<string> {
    return this.isKatexTag(node, true)
      ? Optional.of(ComponentReplacer.extractTextChildContent(node))
      : this.extractKatexBlock(node).map((childNode) => ComponentReplacer.extractTextChildContent(childNode))
  }

  /**
   * Checks if the given node is a KaTeX element.
   *
   * @param node the node to check
   * @param expectedInline defines if the found katex element is expected to be an inline or block element.
   * @return {@link true} if the given node is a katex element.
   */
  private isKatexTag(node: Element, expectedInline: boolean) {
    return (
      node.name === KatexMarkdownExtension.tagName && (node.attribs?.['data-inline'] !== undefined) === expectedInline
    )
  }

  /**
   * Checks if the given node is a KaTeX block.
   *
   * @param node the node to check
   * @return The given node if it is a KaTeX block element, {@link undefined} otherwise.
   */
  private extractKatexBlock(node: Element): Optional<Element> {
    return Optional.of(node)
      .filter((node) => node.name === 'p' && node.children?.length > 0)
      .map((node) =>
        node.children.filter(isTag).find((subNode) => (this.isKatexTag(subNode, false) ? subNode : undefined))
      )
  }
}
