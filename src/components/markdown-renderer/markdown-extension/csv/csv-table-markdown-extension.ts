/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from '../markdown-extension'
import { CsvReplacer } from './csv-replacer'
import type { ComponentReplacer } from '../../replace-components/component-replacer'

/**
 * Adds support for csv tables to the markdown rendering using code fences with "csv" as language.
 */
export class CsvTableMarkdownExtension extends MarkdownExtension {
  public buildReplacers(): ComponentReplacer[] {
    return [new CsvReplacer()]
  }
}
