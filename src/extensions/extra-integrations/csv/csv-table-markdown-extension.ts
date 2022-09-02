/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CsvReplacer } from './csv-replacer'
import { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/markdown-renderer-extension'
import type { ComponentReplacer } from '../../../components/markdown-renderer/replace-components/component-replacer'

/**
 * Adds support for csv tables to the markdown rendering using code fences with "csv" as language.
 */
export class CsvTableMarkdownExtension extends MarkdownRendererExtension {
  public buildReplacers(): ComponentReplacer[] {
    return [new CsvReplacer()]
  }
}
