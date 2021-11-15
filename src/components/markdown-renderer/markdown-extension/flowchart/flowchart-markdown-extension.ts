/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from '../markdown-extension'
import { CodeBlockComponentReplacer } from '../../replace-components/code-block-component-replacer'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { FlowChart } from './flowchart'

/**
 * Adds support for flow charts to the markdown rendering using code fences with "flow" as language.
 */
export class FlowchartMarkdownExtension extends MarkdownExtension {
  public buildReplacers(): ComponentReplacer[] {
    return [new CodeBlockComponentReplacer(FlowChart, 'flow')]
  }
}
