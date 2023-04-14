/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CodeBlockMarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/code-block-markdown-extension/code-block-markdown-renderer-extension'
import { CodeBlockComponentReplacer } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'
import { MermaidChart } from './mermaid-chart'

/**
 * Adds support for chart rendering using mermaid to the markdown rendering using code fences with "mermaid" as language.
 */
export class MermaidMarkdownExtension extends CodeBlockMarkdownRendererExtension {
  public buildReplacers(): CodeBlockComponentReplacer[] {
    return [new CodeBlockComponentReplacer(MermaidChart, 'mermaid')]
  }
}
