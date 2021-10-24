/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type MarkdownIt from 'markdown-it'
import markdownItRegex from 'markdown-it-regex'
import { replaceYouTubeLink } from './replace-youtube-link'
import { replaceLegacyYoutubeShortCode } from './replace-legacy-youtube-short-code'

export const youtubeMarkdownItPlugin: MarkdownIt.PluginSimple = (markdownIt) => {
  markdownItRegex(markdownIt, replaceYouTubeLink)
  markdownItRegex(markdownIt, replaceLegacyYoutubeShortCode)
}
