/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { AbcFrame } from './abc-frame'
import { CodeBlockMarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/code-block-markdown-extension/code-block-markdown-renderer-extension'
import { CodeBlockComponentReplacer } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'

/**
 * Adds support for abc.js to the markdown rendering using code fences with "abc" as language.
 */
export class AbcjsMarkdownExtension extends CodeBlockMarkdownRendererExtension {
  public buildReplacers(): CodeBlockComponentReplacer[] {
    return [new CodeBlockComponentReplacer(AbcFrame, 'abc')]
  }
}
