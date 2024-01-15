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
import { CsvTableMarkdownExtension } from './csv-table-markdown-extension'
import type { CompletionSource } from '@codemirror/autocomplete'

/**
 * Adds support for csv tables to the markdown rendering.
 */
export class CsvTableAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new CsvTableMarkdownExtension()]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [{ i18nKey: 'csv', categoryI18nKey: 'other', topics: [{ i18nKey: 'table' }, { i18nKey: 'header' }] }]
  }

  buildAutocompletion(): CompletionSource[] {
    return [basicCompletion(codeFenceRegex, '```csv delimiter=;\n\n```')]
  }
}
