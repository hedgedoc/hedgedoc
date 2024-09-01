/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/cheatsheet/cheatsheet-extension'
import { regexCompletion } from '../../../components/editor-page/editor-pane/autocompletions/regex-completion'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { EmojiMarkdownRendererExtension } from './emoji-markdown-renderer-extension'
import { emojiShortcodes } from './mapping'
import type { CompletionSource } from '@codemirror/autocomplete'
import { t } from 'i18next'

export class EmojiAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new EmojiMarkdownRendererExtension()]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [
      {
        i18nKey: 'emoji',
        categoryI18nKey: 'other',
        readMoreUrl: new URL('https://twemoji.twitter.com/')
      }
    ]
  }

  buildAutocompletion(): CompletionSource[] {
    const completions = [
      {
        detail: '',
        label: ':'
      },
      ...emojiShortcodes.map((shortcode) => ({
        detail: t('editor.autocompletions.emoji') ?? undefined,
        label: `:${shortcode}:`
      }))
    ]
    return [regexCompletion(/:(?:[\w-+]+:?)?/, completions)]
  }
}
