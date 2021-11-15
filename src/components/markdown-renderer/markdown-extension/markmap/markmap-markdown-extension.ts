/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from '../markdown-extension'
import { CodeBlockComponentReplacer } from '../../replace-components/code-block-component-replacer'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { MarkmapFrame } from './markmap-frame'

/**
 * Adds support for markmap to the markdown rendering using code fences with "markmap" as language.
 */
export class MarkmapMarkdownExtension extends MarkdownExtension {
  public buildReplacers(): ComponentReplacer[] {
    return [new CodeBlockComponentReplacer(MarkmapFrame, 'markmap')]
  }
}
