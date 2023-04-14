/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import type { ComponentReplacer } from '../../../components/markdown-renderer/replace-components/component-replacer'
import { CsvReplacer } from './csv-replacer'

/**
 * Adds support for csv tables to the markdown rendering using code fences with "csv" as language.
 */
export class CsvTableMarkdownExtension extends MarkdownRendererExtension {
  public buildReplacers(): ComponentReplacer[] {
    return [new CsvReplacer()]
  }
}
