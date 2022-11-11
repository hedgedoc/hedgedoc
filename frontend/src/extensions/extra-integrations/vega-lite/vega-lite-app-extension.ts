/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { AppExtension } from '../../base/app-extension'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/markdown-renderer-extension'
import { VegaLiteMarkdownExtension } from './vega-lite-markdown-extension'

/**
 * Adds support for chart rendering using vega lite to the markdown renderer.
 */
export class VegaLiteAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new VegaLiteMarkdownExtension()]
  }
}
