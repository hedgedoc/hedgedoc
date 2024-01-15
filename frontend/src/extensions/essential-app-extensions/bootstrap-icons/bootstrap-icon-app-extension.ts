/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/cheatsheet/cheatsheet-extension'
import { BootstrapLazyIcons } from '../../../components/common/icons/bootstrap-icons'
import { regexCompletion } from '../../../components/editor-page/editor-pane/autocompletions/regex-completion'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { BootstrapIconMarkdownExtension } from './bootstrap-icon-markdown-extension'
import type { CompletionSource } from '@codemirror/autocomplete'
import { t } from 'i18next'

const bootstrapIconNames = Object.keys(BootstrapLazyIcons)

export class BootstrapIconAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new BootstrapIconMarkdownExtension()]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [
      { i18nKey: 'bootstrapIcon', categoryI18nKey: 'other', readMoreUrl: new URL('https://icons.getbootstrap.com/') }
    ]
  }

  buildAutocompletion(): CompletionSource[] {
    return [
      regexCompletion(
        /:(?:[\w-]+:?)?/,
        bootstrapIconNames.map((icon) => ({
          detail: t('editor.autocompletions.icon') ?? undefined,
          label: `:bi-${icon}:`
        }))
      )
    ]
  }
}
