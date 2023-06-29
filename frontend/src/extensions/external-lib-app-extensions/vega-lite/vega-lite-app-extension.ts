/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/cheatsheet/cheatsheet-extension'
import {
  basicCompletion,
  codeFenceRegex
} from '../../../components/editor-page/editor-pane/autocompletions/basic-completion'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { VegaLiteMarkdownExtension } from './vega-lite-markdown-extension'
import type { CompletionSource } from '@codemirror/autocomplete'

/**
 * Adds support for chart rendering using vega lite to the markdown renderer.
 */
export class VegaLiteAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new VegaLiteMarkdownExtension()]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [
      { i18nKey: 'vegaLite', categoryI18nKey: 'charts', readMoreUrl: new URL('https://vega.github.io/vega-lite/') }
    ]
  }

  buildAutocompletion(): CompletionSource[] {
    return [basicCompletion(codeFenceRegex, '```vega-lite\n\n```')]
  }
}
