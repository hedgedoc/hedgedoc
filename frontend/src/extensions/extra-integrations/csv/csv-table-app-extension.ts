/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { AppExtension } from '../../base/app-extension'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/markdown-renderer-extension'
import { CsvTableMarkdownExtension } from './csv-table-markdown-extension'

/**
 * Adds support for csv tables to the markdown rendering.
 */
export class CsvTableAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new CsvTableMarkdownExtension()]
  }
}
