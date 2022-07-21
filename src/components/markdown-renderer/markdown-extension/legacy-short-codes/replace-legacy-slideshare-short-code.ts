/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import markdownItRegex from 'markdown-it-regex'
import type MarkdownIt from 'markdown-it/lib'
import type { RegexOptions } from '../../../../external-types/markdown-it-regex/interface'

const finalRegex = /^{%slideshare (\w+\/[\w-]+) ?%}$/

/**
 * Configure the given {@link MarkdownIt} to render legacy hedgedoc 1 slideshare shortcodes as HTML links.
 *
 * @param markdownIt The {@link MarkdownIt} to configure
 */
export const legacySlideshareShortCode: MarkdownIt.PluginSimple = (markdownIt) => {
  markdownItRegex(markdownIt, {
    name: 'legacy-slideshare-short-code',
    regex: finalRegex,
    replace: (match) => `<a href='https://www.slideshare.net/${match}'>https://www.slideshare.net/${match}</a>`
  } as RegexOptions)
}
