/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RegexOptions } from '../../../../external-types/markdown-it-regex/interface'
import { YoutubeMarkdownExtension } from './youtube-markdown-extension'
import markdownItRegex from 'markdown-it-regex'
import type MarkdownIt from 'markdown-it'

const protocolRegex = /(?:http(?:s)?:\/\/)?/
const subdomainRegex = /(?:www.)?/
const pathRegex = /(?:youtube(?:-nocookie)?\.com\/(?:[^\\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)/
const idRegex = /([^"&?\\/\s]{11})/
const tailRegex = /(?:[?&#].*)?/
const youtubeVideoUrlRegex = new RegExp(
  `(?:${protocolRegex.source}${subdomainRegex.source}${pathRegex.source}${idRegex.source}${tailRegex.source})`
)
const linkRegex = new RegExp(`^${youtubeVideoUrlRegex.source}$`, 'i')

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
