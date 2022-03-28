/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type MarkdownIt from 'markdown-it'
import { codeBlockMarkdownPlugin } from './code-block-markdown-plugin'
import { MarkdownExtension } from '../markdown-extension'

/**
 * A {@link MarkdownExtension markdown extension} that is used for code fence replacements.
 */
export abstract class CodeBlockMarkdownExtension extends MarkdownExtension {
  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    codeBlockMarkdownPlugin(markdownIt)
  }
}
