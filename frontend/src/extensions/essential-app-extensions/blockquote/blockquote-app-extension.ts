/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/cheatsheet/cheatsheet-extension'
import { basicCompletion } from '../../../components/editor-page/editor-pane/autocompletions/basic-completion'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { BlockquoteExtraTagMarkdownExtension } from './blockquote-extra-tag-markdown-extension'
import type { CompletionSource } from '@codemirror/autocomplete'
import { t } from 'i18next'

const blockquoteTagRegex = /(?:^|\s)\[(?:\w+)?/

/**
 * Adds support for generic blockquote extra tags and blockquote color extra tags.
 */
export class BlockquoteAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new BlockquoteExtraTagMarkdownExtension()]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [
      {
        i18nKey: 'blockquoteTags',
        categoryI18nKey: 'other',
        topics: [{ i18nKey: 'name' }, { i18nKey: 'color' }, { i18nKey: 'time' }]
      }
    ]
  }

  buildAutocompletion(): CompletionSource[] {
    return [
      basicCompletion(blockquoteTagRegex, '[name=]', t('editor.autocompletions.tagName') ?? undefined),
      basicCompletion(blockquoteTagRegex, '[time=]', t('editor.autocompletions.tagTime') ?? undefined),
      basicCompletion(blockquoteTagRegex, '[color=]', t('editor.autocompletions.tagColor') ?? undefined)
    ]
  }
}
