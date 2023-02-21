/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/editor-page/cheatsheet/cheatsheet-extension'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/markdown-renderer-extension'
import { AppExtension } from '../../base/app-extension'
import { AsciinemaMarkdownExtension } from './asciinema-markdown-extension'

/**
 * Adds support for Asciinema embeddings to the markdown rendering.
 *
 * @see https://asciinema.org
 */
export class AsciinemaAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new AsciinemaMarkdownExtension()]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [{ i18nKey: 'asciinema', categoryI18nKey: 'embedding', readMoreUrl: new URL('https://asciinema.org/') }]
  }
}
