/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import type { ComponentReplacer } from '../../../components/markdown-renderer/replace-components/component-replacer'
import { KatexReplacer } from './katex-replacer'
import type MarkdownIt from 'markdown-it'
import mathJax from 'markdown-it-mathjax'

/**
 * Adds support for rendering of LaTeX code using KaTeX.
 *
 * @see https://katex.org/
 */
export class KatexMarkdownExtension extends MarkdownRendererExtension {
  public static readonly tagName = 'app-katex'

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    mathJax({
      beforeMath: `<${KatexMarkdownExtension.tagName}>`,
      afterMath: `</${KatexMarkdownExtension.tagName}>`,
      beforeInlineMath: `<${KatexMarkdownExtension.tagName} data-inline="true">`,
      afterInlineMath: `</${KatexMarkdownExtension.tagName}>`,
      beforeDisplayMath: `<${KatexMarkdownExtension.tagName}>`,
      afterDisplayMath: `</${KatexMarkdownExtension.tagName}>`
    })(markdownIt)
  }

  public buildReplacers(): ComponentReplacer[] {
    return [new KatexReplacer()]
  }

  public buildTagNameAllowList(): string[] {
    return [KatexMarkdownExtension.tagName]
  }
}
