/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AppExtension } from '../../../../extensions/base/app-extension'
import { BootstrapLazyIcons } from '../../../common/icons/bootstrap-icons'
import type { CheatsheetExtension } from '../../../editor-page/cheatsheet/cheatsheet-extension'
import { regexCompletion } from '../../../editor-page/editor-pane/autocompletions/regex-completion'
import type { MarkdownRendererExtension } from '../base/markdown-renderer-extension'
import { BootstrapIconMarkdownExtension } from './bootstrap-icon-markdown-extension'
import type { CompletionSource } from '@codemirror/autocomplete'
import { t } from 'i18next'

const bootstrapIconNames = Object.keys(BootstrapLazyIcons)

export class BootstrapIconAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new BootstrapIconMarkdownExtension()]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [{ i18nKey: 'bootstrapIcon', readMoreUrl: new URL('https://icons.getbootstrap.com/') }]
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
