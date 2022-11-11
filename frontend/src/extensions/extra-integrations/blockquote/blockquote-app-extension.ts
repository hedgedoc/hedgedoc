/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { AppExtension } from '../../base/app-extension'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/markdown-renderer-extension'
import { BlockquoteExtraTagMarkdownExtension } from './blockquote-extra-tag-markdown-extension'

/**
 * Adds support for generic blockquote extra tags and blockquote color extra tags.
 */
export class BlockquoteAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new BlockquoteExtraTagMarkdownExtension()]
  }
}
