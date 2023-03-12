/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AppExtension } from '../../../../extensions/base/app-extension'
import type { CheatsheetExtension } from '../../../editor-page/cheatsheet/cheatsheet-extension'
import { basicCompletion } from '../../../editor-page/editor-pane/autocompletions/basic-completion'
import type { MarkdownRendererExtension } from '../base/markdown-renderer-extension'
import { TableOfContentsMarkdownExtension } from './table-of-contents-markdown-extension'
import type { CompletionSource } from '@codemirror/autocomplete'
import type EventEmitter2 from 'eventemitter2'
import { t } from 'i18next'

export class TableOfContentsAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(eventEmitter?: EventEmitter2): MarkdownRendererExtension[] {
    return [new TableOfContentsMarkdownExtension(eventEmitter)]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [
      {
        i18nKey: 'toc',
        entries: [
          {
            i18nKey: 'basic'
          },
          {
            i18nKey: 'levelLimit'
          }
        ]
      }
    ]
  }

  buildAutocompletion(): CompletionSource[] {
    return [basicCompletion(/\[(?:t|to|toc)?/, '[toc]', t('editor.autocompletions.toc') ?? undefined)]
  }
}
