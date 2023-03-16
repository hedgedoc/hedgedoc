/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/editor-page/cheatsheet/cheatsheet-extension'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/markdown-renderer-extension'
import { AppExtension } from '../../base/app-extension'
import { BlockquoteExtraTagMarkdownExtension } from './blockquote-extra-tag-markdown-extension'

/**
 * Adds support for generic blockquote extra tags and blockquote color extra tags.
 */
export class BlockquoteAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new BlockquoteExtraTagMarkdownExtension()]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [{ i18nKey: 'blockquoteTags', entries: [{ i18nKey: 'name' }, { i18nKey: 'color' }, { i18nKey: 'time' }] }]
  }
}
