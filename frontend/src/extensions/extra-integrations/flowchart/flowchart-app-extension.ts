/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { AppExtension } from '../../base/app-extension'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/markdown-renderer-extension'
import { FlowchartMarkdownExtension } from './flowchart-markdown-extension'

/**
 * Adds support for flow charts to the markdown rendering.
 */
export class FlowchartAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new FlowchartMarkdownExtension()]
  }
}
