/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import type { ComponentReplacer } from '../../../components/markdown-renderer/replace-components/component-replacer'
import { CustomTagWithIdComponentReplacer } from '../../../components/markdown-renderer/replace-components/custom-tag-with-id-component-replacer'
import { replaceLegacyYoutubeShortCodeMarkdownItPlugin } from './replace-legacy-youtube-short-code'
import { replaceYouTubeLinkMarkdownItPlugin } from './replace-youtube-link'
import { YouTubeFrame } from './youtube-frame'
import type MarkdownIt from 'markdown-it'

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
