/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from '../markdown-extension'
import { CodeBlockComponentReplacer } from '../../replace-components/code-block-component-replacer'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { MermaidChart } from './mermaid-chart'

/**
 * Adds support for chart rendering using mermaid to the markdown rendering using code fences with "mermaid" as language.
 */
export class MermaidMarkdownExtension extends MarkdownExtension {
  public buildReplacers(): ComponentReplacer[] {
    return [new CodeBlockComponentReplacer(MermaidChart, 'mermaid')]
  }
}
