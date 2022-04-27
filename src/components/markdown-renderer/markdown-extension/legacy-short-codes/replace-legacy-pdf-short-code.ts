/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import markdownItRegex from 'markdown-it-regex'
import type MarkdownIt from 'markdown-it/lib'
import type { RegexOptions } from '../../../../external-types/markdown-it-regex/interface'

const finalRegex = /^{%pdf (\S*) *%}$/

export const legacyPdfShortCode: MarkdownIt.PluginSimple = (markdownIt) => {
  markdownItRegex(markdownIt, {
    name: 'legacy-pdf-short-code',
    regex: finalRegex,
    replace: (match) => `<a href="${match}">${match}</a>`
  } as RegexOptions)
}
