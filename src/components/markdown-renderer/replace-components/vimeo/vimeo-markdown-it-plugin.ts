/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type MarkdownIt from 'markdown-it'
import markdownItRegex from 'markdown-it-regex'
import { replaceVimeoLink } from './replace-vimeo-link'
import { replaceLegacyVimeoShortCode } from './replace-legacy-vimeo-short-code'

export const vimeoMarkdownItPlugin: MarkdownIt.PluginSimple = (markdownIt) => {
  markdownItRegex(markdownIt, replaceVimeoLink)
  markdownItRegex(markdownIt, replaceLegacyVimeoShortCode)
}
