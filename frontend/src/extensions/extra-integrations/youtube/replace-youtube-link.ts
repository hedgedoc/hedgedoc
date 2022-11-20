/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { YoutubeMarkdownExtension } from './youtube-markdown-extension'
import markdownItRegex from 'markdown-it-regex'
import type MarkdownIt from 'markdown-it'
import type { RegexOptions } from '../../../external-types/markdown-it-regex/interface'

const linkRegex =
  /^(?:https?:\/\/)?(?:www.)?(?:youtube(?:-nocookie)?\.com\/(?:[^\\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})(?:[?&#].*)?$/i

/**
 * Replacer for youtube links.
 */
export const replaceYouTubeLinkMarkdownItPlugin: MarkdownIt.PluginSimple = (markdownIt: MarkdownIt) =>
  markdownItRegex(markdownIt, {
    name: 'youtube-link',
    regex: linkRegex,
    replace: (match) => {
      // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
      // noinspection CheckTagEmptyBody
      return `<${YoutubeMarkdownExtension.tagName} id="${match}"></${YoutubeMarkdownExtension.tagName}>`
    }
  } as RegexOptions)
