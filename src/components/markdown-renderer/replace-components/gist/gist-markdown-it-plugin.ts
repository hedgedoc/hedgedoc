/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type MarkdownIt from 'markdown-it'
import markdownItRegex from 'markdown-it-regex'
import { replaceGistLink } from './replace-gist-link'
import { replaceLegacyGistShortCode } from './replace-legacy-gist-short-code'

export const gistMarkdownItPlugin: MarkdownIt.PluginSimple = (markdownIt) => {
  markdownItRegex(markdownIt, replaceGistLink)
  markdownItRegex(markdownIt, replaceLegacyGistShortCode)
}
