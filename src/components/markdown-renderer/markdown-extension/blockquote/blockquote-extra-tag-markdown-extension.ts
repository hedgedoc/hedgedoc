/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from '../markdown-extension'
import { BlockquoteColorExtraTagReplacer } from './blockquote-color-extra-tag-replacer'
import { BlockquoteExtraTagReplacer } from './blockquote-extra-tag-replacer'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { BlockquoteExtraTagMarkdownItPlugin } from './blockquote-extra-tag-markdown-it-plugin'
import type MarkdownIt from 'markdown-it'
import type { NodeProcessor } from '../../node-preprocessors/node-processor'
import { BlockquoteBorderColorNodePreprocessor } from './blockquote-border-color-node-preprocessor'

/**
 * Adds support for generic blockquote extra tags and blockquote color extra tags.
 */
export class BlockquoteExtraTagMarkdownExtension extends MarkdownExtension {
  public static readonly tagName = 'app-blockquote-tag'

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    new BlockquoteExtraTagMarkdownItPlugin('color', 'tag').registerInlineRule(markdownIt)
    new BlockquoteExtraTagMarkdownItPlugin('name', 'user').registerInlineRule(markdownIt)
    new BlockquoteExtraTagMarkdownItPlugin('time', 'clock-o').registerInlineRule(markdownIt)
    BlockquoteExtraTagMarkdownItPlugin.registerRenderer(markdownIt)
  }

  public buildReplacers(): ComponentReplacer[] {
    return [new BlockquoteColorExtraTagReplacer(), new BlockquoteExtraTagReplacer()]
  }

  public buildNodeProcessors(): NodeProcessor[] {
    return [new BlockquoteBorderColorNodePreprocessor()]
  }

  public buildTagNameWhitelist(): string[] {
    return [BlockquoteExtraTagMarkdownExtension.tagName]
  }
}
