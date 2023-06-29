/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/cheatsheet/cheatsheet-extension'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { AppExtension } from '../../_base-classes/app-extension'
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
