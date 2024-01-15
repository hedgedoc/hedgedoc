/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/cheatsheet/cheatsheet-extension'
import { basicCompletion } from '../../../components/editor-page/editor-pane/autocompletions/basic-completion'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { BasicMarkdownSyntaxMarkdownExtension } from './basic-markdown-syntax-markdown-extension'
import type { CompletionSource } from '@codemirror/autocomplete'
import { t } from 'i18next'

export class BasicMarkdownSyntaxAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new BasicMarkdownSyntaxMarkdownExtension()]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [
      {
        i18nKey: 'basics.basicFormatting',
        categoryI18nKey: 'basics'
      },
      {
        i18nKey: 'basics.abbreviation',
        categoryI18nKey: 'basics'
      },
      {
        i18nKey: 'basics.footnote',
        categoryI18nKey: 'basics'
      },
      {
        i18nKey: 'basics.headlines',
        categoryI18nKey: 'basics',
        topics: [
          {
            i18nKey: 'hashtag'
          },
          {
            i18nKey: 'equal'
          }
        ]
      },
      {
        i18nKey: 'basics.code',
        categoryI18nKey: 'basics',
        topics: [
          {
            i18nKey: 'inline'
          },
          {
            i18nKey: 'block'
          }
        ]
      },
      {
        i18nKey: 'basics.lists',
        categoryI18nKey: 'basics',
        topics: [
          {
            i18nKey: 'unordered'
          },
          {
            i18nKey: 'ordered'
          }
        ]
      },
      {
        i18nKey: 'basics.images',
        categoryI18nKey: 'basics',
        topics: [
          {
            i18nKey: 'basic'
          },
          {
            i18nKey: 'size'
          }
        ]
      },
      {
        i18nKey: 'basics.links',
        categoryI18nKey: 'basics'
      }
    ]
  }

  buildAutocompletion(): CompletionSource[] {
    return [basicCompletion(/(^|\s)\[/, '[](https://)', t('editor.autocompletions.link') ?? undefined)]
  }
}
