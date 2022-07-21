/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from '../markdown-extension'
import { addLineToPlaceholderImageTags } from './add-line-to-placeholder-image-tags'
import type MarkdownIt from 'markdown-it/lib'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { ImagePlaceholderReplacer } from './image-placeholder-replacer'

/**
 * Adds support for {@link ImagePlaceholder}.
 */
export class ImagePlaceholderMarkdownExtension extends MarkdownExtension {
  public static readonly PLACEHOLDER_URL = 'https://'

  constructor(private lineOffset: number) {
    super()
  }

  configureMarkdownIt(markdownIt: MarkdownIt): void {
    addLineToPlaceholderImageTags(markdownIt)
  }

  buildReplacers(): ComponentReplacer[] {
    return [new ImagePlaceholderReplacer(this.lineOffset)]
  }
}
