/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/cheatsheet/cheatsheet-extension'
import type { Linter } from '../../../components/editor-page/editor-pane/linter/linter'
import { SingleLineRegexLinter } from '../../../components/editor-page/editor-pane/linter/single-line-regex-linter'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { legacyYouTubeRegex } from './replace-legacy-youtube-short-code'
import { YoutubeMarkdownExtension } from './youtube-markdown-extension'
import { t } from 'i18next'

/**
 * Adds YouTube video embeddings to the markdown renderer.
 */
export class YoutubeAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new YoutubeMarkdownExtension()]
  }

  public buildCodeMirrorLinter(): Linter[] {
    return [
      new SingleLineRegexLinter(
        legacyYouTubeRegex,
        t('editor.linter.shortcode', { shortcode: 'YouTube' }),
        (match: string) => `https://www.youtube.com/watch?v=${match}`
      )
    ]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [{ i18nKey: 'youtube', categoryI18nKey: 'embedding', readMoreUrl: new URL('https://youtube.com/') }]
  }
}
