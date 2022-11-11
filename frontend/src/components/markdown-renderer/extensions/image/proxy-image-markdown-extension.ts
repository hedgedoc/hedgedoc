/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownRendererExtension } from '../base/markdown-renderer-extension'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { ProxyImageReplacer } from './proxy-image-replacer'

/**
 * Adds support for image lightbox and image proxy redirection.
 */
export class ProxyImageMarkdownExtension extends MarkdownRendererExtension {
  buildReplacers(): ComponentReplacer[] {
    return [new ProxyImageReplacer()]
  }
}
