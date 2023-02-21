/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AppExtension } from '../../../../extensions/base/app-extension'
import type { CheatsheetExtension } from '../../../editor-page/cheatsheet/cheatsheet-extension'
import type { MarkdownRendererExtension } from '../base/markdown-renderer-extension'
import { BootstrapIconMarkdownExtension } from './bootstrap-icon-markdown-extension'

export class BootstrapIconAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new BootstrapIconMarkdownExtension()]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [{ i18nKey: 'bootstrapIcon', readMoreUrl: new URL('https://icons.getbootstrap.com/') }]
  }
}
