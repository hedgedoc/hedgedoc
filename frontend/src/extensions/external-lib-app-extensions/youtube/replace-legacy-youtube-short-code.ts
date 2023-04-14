/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RegexOptions } from '../../../external-types/markdown-it-regex/interface'
import { YoutubeMarkdownExtension } from './youtube-markdown-extension'
import type MarkdownIt from 'markdown-it'
import markdownItRegex from 'markdown-it-regex'

export const legacyYouTubeRegex = /^{%youtube\s+([\w-]{11})\s*%}$/

/**
 * Configure the given {@link MarkdownIt} to render legacy hedgedoc 1 youtube short codes as embeddings.
 *
 * @param markdownIt The {@link MarkdownIt} to configure
 */
export const replaceLegacyYoutubeShortCodeMarkdownItPlugin: MarkdownIt.PluginSimple = (markdownIt: MarkdownIt): void =>
  markdownItRegex(markdownIt, {
    name: 'legacy-youtube-short-code',
    regex: legacyYouTubeRegex,
    replace: (match) => {
      // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
      // noinspection CheckTagEmptyBody
      return `<${YoutubeMarkdownExtension.tagName} id="${match}"></${YoutubeMarkdownExtension.tagName}>`
    }
  } as RegexOptions)
