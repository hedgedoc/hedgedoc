/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import markdownItRegex from 'markdown-it-regex'
import type MarkdownIt from 'markdown-it/lib'

const finalRegex = /^{%slideshare (\w+\/[\w-]+) ?%}$/

export const legacySlideshareShortCode: MarkdownIt.PluginSimple = (markdownIt) => {
  markdownItRegex(markdownIt, {
    name: 'legacy-slideshare-short-code',
    regex: finalRegex,
    replace: (match: string) => {
      return `<a target="_blank" rel="noopener noreferrer" href="https://www.slideshare.net/${match}">https://www.slideshare.net/${match}</a>`
    }
  })
}
