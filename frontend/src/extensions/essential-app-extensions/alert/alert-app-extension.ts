/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/cheatsheet/cheatsheet-extension'
import { basicCompletion } from '../../../components/editor-page/editor-pane/autocompletions/basic-completion'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { AlertMarkdownExtension } from './alert-markdown-extension'
import type { CompletionSource } from '@codemirror/autocomplete'
import { t } from 'i18next'

const alertRegex = /(?:^|\s):(?::|::|::\w+)?/

/**
 * Adds alert boxes to the markdown rendering.
 */
export class AlertAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new AlertMarkdownExtension()]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [{ i18nKey: 'alert', categoryI18nKey: 'other' }]
  }

  buildAutocompletion(): CompletionSource[] {
    return [
      basicCompletion(alertRegex, ':::success\n\n:::', t('editor.autocompletions.successBox') ?? undefined),
      basicCompletion(alertRegex, ':::info\n\n:::', t('editor.autocompletions.infoBox') ?? undefined),
      basicCompletion(alertRegex, ':::warning\n\n:::', t('editor.autocompletions.warningBox') ?? undefined),
      basicCompletion(alertRegex, ':::danger\n\n:::', t('editor.autocompletions.errorBox') ?? undefined)
    ]
  }
}
