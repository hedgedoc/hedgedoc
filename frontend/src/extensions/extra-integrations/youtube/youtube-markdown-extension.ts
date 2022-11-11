/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { replaceYouTubeLinkMarkdownItPlugin } from './replace-youtube-link'
import { replaceLegacyYoutubeShortCodeMarkdownItPlugin } from './replace-legacy-youtube-short-code'
import type MarkdownIt from 'markdown-it'
import { YouTubeFrame } from './youtube-frame'
import { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/markdown-renderer-extension'
import { CustomTagWithIdComponentReplacer } from '../../../components/markdown-renderer/replace-components/custom-tag-with-id-component-replacer'
import type { ComponentReplacer } from '../../../components/markdown-renderer/replace-components/component-replacer'

/**
 * Adds YouTube video embeddings using link detection and the legacy YouTube short code syntax.
 */
export class YoutubeMarkdownExtension extends MarkdownRendererExtension {
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
}
