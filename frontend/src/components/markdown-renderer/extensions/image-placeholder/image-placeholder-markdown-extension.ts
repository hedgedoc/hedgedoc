/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { MarkdownRendererExtension } from '../base/markdown-renderer-extension'
import { addLineToPlaceholderImageTags } from './add-line-to-placeholder-image-tags'
import { ImagePlaceholderReplacer } from './image-placeholder-replacer'
import type MarkdownIt from 'markdown-it/lib'

/**
 * Adds support for {@link ImagePlaceholder}.
 */
export class ImagePlaceholderMarkdownExtension extends MarkdownRendererExtension {
  public static readonly PLACEHOLDER_URL = 'https://'

  constructor() {
    super()
  }

  configureMarkdownIt(markdownIt: MarkdownIt): void {
    addLineToPlaceholderImageTags(markdownIt)
  }

  buildReplacers(): ComponentReplacer[] {
    return [new ImagePlaceholderReplacer()]
  }
}
