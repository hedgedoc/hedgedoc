/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RegexOptions } from '../../../external-types/markdown-it-regex/interface'
import markdownItRegex from 'markdown-it-regex'
import type MarkdownIt from 'markdown-it/lib'

export const legacyPdfRegex = /^{%pdf\s+(\S*)\s*%}$/

/**
 * Configure the given {@link MarkdownIt} to render legacy hedgedoc 1 pdf shortcodes as html links.
 *
 * @param markdownIt The {@link MarkdownIt} to configure
 */
export const legacyPdfShortCode: MarkdownIt.PluginSimple = (markdownIt) => {
  markdownItRegex(markdownIt, {
    name: 'legacy-pdf-short-code',
    regex: legacyPdfRegex,
    replace: (match) => `<a href="${match}">${match}</a>`
  } as RegexOptions)
}
