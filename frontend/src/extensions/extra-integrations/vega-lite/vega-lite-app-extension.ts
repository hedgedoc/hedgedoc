/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/editor-page/cheatsheet/cheatsheet-extension'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/markdown-renderer-extension'
import { AppExtension } from '../../base/app-extension'
import { VegaLiteMarkdownExtension } from './vega-lite-markdown-extension'

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
}
