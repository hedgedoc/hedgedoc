/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/cheatsheet/cheatsheet-extension'
import { basicCompletion } from '../../../components/editor-page/editor-pane/autocompletions/basic-completion'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { ImagePlaceholderMarkdownExtension } from './image-placeholder-markdown-extension'
import type { CompletionSource } from '@codemirror/autocomplete'
import { t } from 'i18next'

export class ImagePlaceholderAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new ImagePlaceholderMarkdownExtension()]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [
      {
        i18nKey: 'imagePlaceholder',
        categoryI18nKey: 'other'
      }
    ]
  }

  buildAutocompletion(): CompletionSource[] {
    return [
      basicCompletion(/(^|\s)!\[?/, '![alt text](https://)', t('editor.autocompletions.image') ?? undefined),
      basicCompletion(
        /(^|\s)!\[?/,
        '![alt text](https:// =200x500)',
        t('editor.autocompletions.imageWithDimensions') ?? undefined
      )
    ]
  }
}
