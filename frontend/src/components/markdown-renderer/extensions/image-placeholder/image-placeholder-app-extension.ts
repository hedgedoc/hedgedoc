/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AppExtension } from '../../../../extensions/base/app-extension'
import type { CheatsheetExtension } from '../../../editor-page/cheatsheet/cheatsheet-extension'
import type { MarkdownRendererExtension } from '../base/markdown-renderer-extension'
import { ImagePlaceholderMarkdownExtension } from './image-placeholder-markdown-extension'

export class ImagePlaceholderAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new ImagePlaceholderMarkdownExtension()]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [
      {
        i18nKey: 'imagePlaceholder'
      }
    ]
  }
}
