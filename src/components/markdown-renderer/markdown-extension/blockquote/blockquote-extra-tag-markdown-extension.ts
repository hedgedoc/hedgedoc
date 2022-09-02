/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from '../markdown-extension'
import { BlockquoteColorExtraTagReplacer } from './blockquote-color-extra-tag-replacer'
import { BlockquoteExtraTagReplacer } from './blockquote-extra-tag-replacer'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import type MarkdownIt from 'markdown-it'
import type { NodeProcessor } from '../../node-preprocessors/node-processor'
import { BlockquoteBorderColorNodePreprocessor } from './blockquote-border-color-node-preprocessor'
import { BlockquoteExtraTagMarkdownItPlugin } from './blockquote-extra-tag-markdown-it-plugin'

/**
 * Adds support for generic blockquote extra tags and blockquote color extra tags.
 */
export class BlockquoteExtraTagMarkdownExtension extends MarkdownExtension {
  public static readonly tagName = 'app-blockquote-tag'

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    new BlockquoteExtraTagMarkdownItPlugin('color', 'tag').registerRule(markdownIt)
    new BlockquoteExtraTagMarkdownItPlugin('name', 'user').registerRule(markdownIt)
    new BlockquoteExtraTagMarkdownItPlugin('time', 'clock-o').registerRule(markdownIt)
  }

  public buildReplacers(): ComponentReplacer[] {
    return [new BlockquoteColorExtraTagReplacer(), new BlockquoteExtraTagReplacer()]
  }

  public buildNodeProcessors(): NodeProcessor[] {
    return [new BlockquoteBorderColorNodePreprocessor()]
  }

  public buildTagNameAllowList(): string[] {
    return [BlockquoteExtraTagMarkdownExtension.tagName]
  }
}
