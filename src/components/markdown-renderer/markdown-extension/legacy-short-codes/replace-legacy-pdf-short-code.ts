/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import markdownItRegex from 'markdown-it-regex'
import type MarkdownIt from 'markdown-it/lib'
import type { RegexOptions } from '../../../../external-types/markdown-it-regex/interface'

const finalRegex = /^{%pdf (\S*) *%}$/

/**
 * Configure the given {@link MarkdownIt} to render legacy hedgedoc 1 pdf shortcodes as html links.
 *
 * @param markdownIt The {@link MarkdownIt} to configure
 */
export const legacyPdfShortCode: MarkdownIt.PluginSimple = (markdownIt) => {
  markdownItRegex(markdownIt, {
    name: 'legacy-pdf-short-code',
    regex: finalRegex,
    replace: (match) => `<a href="${match}">${match}</a>`
  } as RegexOptions)
}
