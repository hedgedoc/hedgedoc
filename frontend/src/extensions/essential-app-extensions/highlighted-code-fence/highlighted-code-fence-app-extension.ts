/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/cheatsheet/cheatsheet-extension'
import { codeFenceRegex } from '../../../components/editor-page/editor-pane/autocompletions/basic-completion'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { HighlightedCodeMarkdownExtension } from './highlighted-code-markdown-extension'
import type { CompletionContext, CompletionResult, CompletionSource } from '@codemirror/autocomplete'
import { languages } from '@codemirror/language-data'
import { t } from 'i18next'

/**
 * Adds code highlighting to the markdown rendering.
 */
export class HighlightedCodeFenceAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new HighlightedCodeMarkdownExtension()]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [
      {
        i18nKey: 'codeHighlighting',
        categoryI18nKey: 'other',
        topics: [{ i18nKey: 'language' }, { i18nKey: 'lineNumbers' }, { i18nKey: 'lineWrapping' }]
      }
    ]
  }

  buildAutocompletion(): CompletionSource[] {
    const completions = [
      {
        detail: t('editor.editorToolbar.code'),
        label: '```\n\n```'
      },
      ...languages.map((lang) => ({
        detail: lang.name,
        label: '```' + lang.alias[0] + '\n\n```'
      }))
    ]
    return [
      (context: CompletionContext): CompletionResult | null => {
        const match = context.matchBefore(codeFenceRegex)
        if (!match || (match.from === match.to && !context.explicit)) {
          return null
        }
        return {
          from: match.from,
          options: completions
        }
      }
    ]
  }
}
