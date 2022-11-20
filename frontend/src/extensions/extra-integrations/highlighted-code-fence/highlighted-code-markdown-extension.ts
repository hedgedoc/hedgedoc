/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { HighlightedCodeReplacer } from './highlighted-code-replacer'
import { CodeBlockMarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/code-block-markdown-extension/code-block-markdown-renderer-extension'
import type { ComponentReplacer } from '../../../components/markdown-renderer/replace-components/component-replacer'

/**
 * Adds code highlighting to the markdown rendering.
 * Every code fence that is not replaced by another replacer is highlighted using highlight-js.
 */
export class HighlightedCodeMarkdownExtension extends CodeBlockMarkdownRendererExtension {
  public buildReplacers(): ComponentReplacer[] {
    return [new HighlightedCodeReplacer()]
  }
}
