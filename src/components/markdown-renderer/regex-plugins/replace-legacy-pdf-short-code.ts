/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import markdownItRegex from 'markdown-it-regex'
import type MarkdownIt from 'markdown-it/lib'

const finalRegex = /^{%pdf (.*) ?%}$/

export const legacyPdfShortCode: MarkdownIt.PluginSimple = (markdownIt) => {
  markdownItRegex(markdownIt, {
    name: 'legacy-pdf-short-code',
    regex: finalRegex,
    replace: (match: string) => {
      return `<a target="_blank" rel="noopener noreferrer" href="${match}">${match}</a>`
    }
  })
}
