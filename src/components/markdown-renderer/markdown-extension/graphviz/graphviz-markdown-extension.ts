/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CodeBlockComponentReplacer } from '../../replace-components/code-block-component-replacer'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { GraphvizFrame } from './graphviz-frame'
import { CodeBlockMarkdownExtension } from '../code-block-markdown-extension/code-block-markdown-extension'

/**
 * Adds support for graphviz to the markdown rendering using code fences with "graphviz" as language.
 */
export class GraphvizMarkdownExtension extends CodeBlockMarkdownExtension {
  public buildReplacers(): ComponentReplacer[] {
    return [new CodeBlockComponentReplacer(GraphvizFrame, 'graphviz')]
  }
}
