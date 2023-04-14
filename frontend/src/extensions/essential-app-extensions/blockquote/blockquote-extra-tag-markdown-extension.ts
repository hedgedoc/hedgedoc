/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import type { NodeProcessor } from '../../../components/markdown-renderer/node-preprocessors/node-processor'
import type { ComponentReplacer } from '../../../components/markdown-renderer/replace-components/component-replacer'
import { BlockquoteBorderColorNodePreprocessor } from './blockquote-border-color-node-preprocessor'
import { BlockquoteColorExtraTagReplacer } from './blockquote-color-extra-tag-replacer'
import { BlockquoteExtraTagMarkdownItPlugin } from './blockquote-extra-tag-markdown-it-plugin'
import { BlockquoteExtraTagReplacer } from './blockquote-extra-tag-replacer'
import type MarkdownIt from 'markdown-it'

/**
 * Adds support for generic blockquote extra tags and blockquote color extra tags.
 */
export class BlockquoteExtraTagMarkdownExtension extends MarkdownRendererExtension {
  public static readonly tagName = 'app-blockquote-tag'

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    new BlockquoteExtraTagMarkdownItPlugin('color', 'tag').registerRule(markdownIt)
    new BlockquoteExtraTagMarkdownItPlugin('name', 'person').registerRule(markdownIt)
    new BlockquoteExtraTagMarkdownItPlugin('time', 'clock').registerRule(markdownIt)
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
