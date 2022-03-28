/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { HighlightedCodeReplacer } from './highlighted-code-replacer'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { CodeBlockMarkdownExtension } from '../code-block-markdown-extension/code-block-markdown-extension'

/**
 * Adds support code highlighting to the markdown rendering.
 * Every code fence that is not replaced by another replacer is highlighted using highlight-js.
 */
export class HighlightedCodeMarkdownExtension extends CodeBlockMarkdownExtension {
  public buildReplacers(): ComponentReplacer[] {
    return [new HighlightedCodeReplacer()]
  }
}
