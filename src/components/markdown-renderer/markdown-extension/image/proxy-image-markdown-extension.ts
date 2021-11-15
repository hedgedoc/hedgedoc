/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from '../markdown-extension'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import type { ImageClickHandler } from './proxy-image-replacer'
import { ProxyImageReplacer } from './proxy-image-replacer'

/**
 * Adds support for image lightbox and image proxy redirection.
 */
export class ProxyImageMarkdownExtension extends MarkdownExtension {
  constructor(private onImageClick?: ImageClickHandler) {
    super()
  }

  buildReplacers(): ComponentReplacer[] {
    return [new ProxyImageReplacer(this.onImageClick)]
  }
}
