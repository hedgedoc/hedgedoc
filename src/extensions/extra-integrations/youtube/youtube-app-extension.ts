/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { AppExtension } from '../../base/app-extension'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/markdown-renderer-extension'
import { YoutubeMarkdownExtension } from './youtube-markdown-extension'
import type { Linter } from '../../../components/editor-page/editor-pane/linter/linter'
import { SingleLineRegexLinter } from '../../../components/editor-page/editor-pane/linter/single-line-regex-linter'
import { legacyYouTubeRegex } from './replace-legacy-youtube-short-code'
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
}
