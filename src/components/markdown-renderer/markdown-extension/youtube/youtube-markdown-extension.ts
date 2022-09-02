/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from '../markdown-extension'
import { replaceYouTubeLinkMarkdownItPlugin } from './replace-youtube-link'
import { legacyYouTubeRegex, replaceLegacyYoutubeShortCodeMarkdownItPlugin } from './replace-legacy-youtube-short-code'
import type MarkdownIt from 'markdown-it'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { CustomTagWithIdComponentReplacer } from '../../replace-components/custom-tag-with-id-component-replacer'
import { YouTubeFrame } from './youtube-frame'
import type { Linter } from '../../../editor-page/editor-pane/linter/linter'
import { SingleLineRegexLinter } from '../../../editor-page/editor-pane/linter/single-line-regex-linter'
import { t } from 'i18next'

/**
 * Adds YouTube video embeddings using link detection and the legacy YouTube short code syntax.
 */
export class YoutubeMarkdownExtension extends MarkdownExtension {
  public static readonly tagName = 'app-youtube'

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    replaceYouTubeLinkMarkdownItPlugin(markdownIt)
    replaceLegacyYoutubeShortCodeMarkdownItPlugin(markdownIt)
  }

  public buildReplacers(): ComponentReplacer[] {
    return [new CustomTagWithIdComponentReplacer(YouTubeFrame, YoutubeMarkdownExtension.tagName)]
  }

  public buildTagNameAllowList(): string[] {
    return [YoutubeMarkdownExtension.tagName]
  }

  public buildLinter(): Linter[] {
    return [
      new SingleLineRegexLinter(
        legacyYouTubeRegex,
        t('editor.linter.shortcode', { shortcode: 'YouTube' }),
        (match: string) => `https://www.youtube.com/watch?v=${match}`
      )
    ]
  }
}
