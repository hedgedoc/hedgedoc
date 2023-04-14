/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Linter } from '../../../components/editor-page/editor-pane/linter/linter'
import { SingleLineRegexLinter } from '../../../components/editor-page/editor-pane/linter/single-line-regex-linter'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { LegacyShortcodesMarkdownExtension } from './legacy-shortcodes-markdown-extension'
import { legacyPdfRegex } from './replace-legacy-pdf-short-code'
import { legacySlideshareRegex } from './replace-legacy-slideshare-short-code'
import { legacySpeakerdeckRegex } from './replace-legacy-speakerdeck-short-code'
import { t } from 'i18next'

/**
 * Adds support for legacy shortcodes (pdf, slideshare and speakerdeck) from HedgeDoc 1 to the markdown renderer.
 */
export class LegacyShortcodesAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new LegacyShortcodesMarkdownExtension()]
  }

  buildCodeMirrorLinter(): Linter[] {
    return [
      new SingleLineRegexLinter(
        legacySpeakerdeckRegex,
        t('editor.linter.shortcode', { shortcode: 'SpeakerDeck' }),
        (match: string) => `https://speakerdeck.com/${match}`
      ),
      new SingleLineRegexLinter(
        legacySlideshareRegex,
        t('editor.linter.shortcode', { shortcode: 'SlideShare' }),
        (match: string) => `https://www.slideshare.net/${match}`
      ),
      new SingleLineRegexLinter(
        legacyPdfRegex,
        t('editor.linter.shortcode', { shortcode: 'PDF' }),
        (match: string) => match
      )
    ]
  }
}
