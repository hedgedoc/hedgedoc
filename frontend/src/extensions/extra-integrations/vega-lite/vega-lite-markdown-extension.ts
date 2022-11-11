/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { VegaLiteChart } from './vega-lite-chart'
import { CodeBlockMarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/code-block-markdown-extension/code-block-markdown-renderer-extension'
import { CodeBlockComponentReplacer } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'

/**
 * Adds support for chart rendering using vega lite to the markdown rendering using code fences with "vega-lite" as language.
 */
export class VegaLiteMarkdownExtension extends CodeBlockMarkdownRendererExtension {
  public buildReplacers(): CodeBlockComponentReplacer[] {
    return [new CodeBlockComponentReplacer(VegaLiteChart, 'vega-lite')]
  }
}
