/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RegexOptions } from '../../../external-types/markdown-it-regex/interface'
import markdownItRegex from 'markdown-it-regex'
import type MarkdownIt from 'markdown-it/lib'

export const legacySpeakerdeckRegex = /^{%speakerdeck\s+(\w+\/[\w-]+)\s*%}$/

/**
 * Configure the given {@link MarkdownIt} to render legacy hedgedoc 1 speakerdeck shortcodes as HTML links.
 *
 * @param markdownIt The {@link MarkdownIt} to configure
 */
export const legacySpeakerdeckShortCode: MarkdownIt.PluginSimple = (markdownIt) => {
  markdownItRegex(markdownIt, {
    name: 'legacy-speakerdeck-short-code',
    regex: legacySpeakerdeckRegex,
    replace: (match) => `<a href="https://speakerdeck.com/${match}">https://speakerdeck.com/${match}</a>`
  } as RegexOptions)
}
