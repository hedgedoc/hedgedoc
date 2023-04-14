/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ComponentReplacer } from '../../../replace-components/component-replacer'
import { MarkdownRendererExtension } from '../markdown-renderer-extension'
import { codeBlockMarkdownPlugin } from './code-block-markdown-plugin'
import type MarkdownIt from 'markdown-it'

/**
 * A {@link MarkdownRendererExtension markdown extension} that is used for code fence replacements.
 */
export abstract class CodeBlockMarkdownRendererExtension extends MarkdownRendererExtension {
  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    codeBlockMarkdownPlugin(markdownIt)
  }

  public buildReplacers(): ComponentReplacer[] {
    return []
  }
}
