/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/cheatsheet/cheatsheet-extension'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { KatexMarkdownExtension } from './katex-markdown-extension'

/**
 * Adds support for LaTeX rendering using KaTeX to the markdown rendering.
 *
 * @see https://katex.org/
 */
export class KatexAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new KatexMarkdownExtension()]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [{ i18nKey: 'katex', categoryI18nKey: 'other', readMoreUrl: new URL('https://katex.org/') }]
  }
}
