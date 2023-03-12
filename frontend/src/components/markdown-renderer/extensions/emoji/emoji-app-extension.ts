/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AppExtension } from '../../../../extensions/base/app-extension'
import type { CheatsheetExtension } from '../../../editor-page/cheatsheet/cheatsheet-extension'
import { regexCompletion } from '../../../editor-page/editor-pane/autocompletions/regex-completion'
import type { MarkdownRendererExtension } from '../base/markdown-renderer-extension'
import { EmojiMarkdownExtension } from './emoji-markdown-extension'
import { emojiShortcodes } from './mapping'
import type { CompletionSource } from '@codemirror/autocomplete'
import { t } from 'i18next'

export class EmojiAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new EmojiMarkdownExtension()]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [
      {
        i18nKey: 'emoji',
        readMoreUrl: new URL('https://twemoji.twitter.com/')
      }
    ]
  }

  buildAutocompletion(): CompletionSource[] {
    return [
      regexCompletion(
        /:(?:[\w-+]+:?)?/,
        emojiShortcodes.map((shortcode) => ({
          detail: t('editor.autocompletions.emoji') ?? undefined,
          label: `:${shortcode}:`
        }))
      )
    ]
  }
}
