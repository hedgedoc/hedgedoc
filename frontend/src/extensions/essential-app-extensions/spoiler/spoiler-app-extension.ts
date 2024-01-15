/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/cheatsheet/cheatsheet-extension'
import { basicCompletion } from '../../../components/editor-page/editor-pane/autocompletions/basic-completion'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { SpoilerMarkdownExtension } from './spoiler-markdown-extension'
import type { CompletionSource } from '@codemirror/autocomplete'
import { t } from 'i18next'

const spoilerRegex = /(?:^|\s):(?::|::|::\w+)?/

/**
 * Adds support for html spoiler tags.
 *
 * @see https://www.w3schools.com/tags/tag_details.asp
 */
export class SpoilerAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new SpoilerMarkdownExtension()]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [{ i18nKey: 'spoiler', categoryI18nKey: 'other' }]
  }

  buildAutocompletion(): CompletionSource[] {
    return [
      basicCompletion(spoilerRegex, ':::spoiler Label text\n\n:::', t('editor.autocompletions.spoiler') ?? undefined)
    ]
  }
}
