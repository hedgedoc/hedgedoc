/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type MarkdownIt from 'markdown-it'
import { legacyPdfShortCode } from './replace-legacy-pdf-short-code'
import { legacySlideshareShortCode } from './replace-legacy-slideshare-short-code'
import { legacySpeakerdeckShortCode } from './replace-legacy-speakerdeck-short-code'
import { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/markdown-renderer-extension'

/**
 * Adds support for legacy shortcodes (pdf, slideshare and speakerdeck) by replacing them with anchor elements.
 */
export class LegacyShortcodesMarkdownExtension extends MarkdownRendererExtension {
  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    legacyPdfShortCode(markdownIt)
    legacySlideshareShortCode(markdownIt)
    legacySpeakerdeckShortCode(markdownIt)
  }
}
