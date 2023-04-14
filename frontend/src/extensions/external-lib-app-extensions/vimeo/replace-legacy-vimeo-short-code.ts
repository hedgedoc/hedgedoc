/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RegexOptions } from '../../../external-types/markdown-it-regex/interface'
import { VimeoMarkdownExtension } from './vimeo-markdown-extension'
import type MarkdownIt from 'markdown-it'
import markdownItRegex from 'markdown-it-regex'

export const legacyVimeoRegex = /^{%vimeo\s+(\d{6,11})\s*%}$/

/**
 * Configure the given {@link MarkdownIt} to render legacy hedgedoc 1 vimeo short codes as embeddings.
 *
 * @param markdownIt The {@link MarkdownIt} to configure
 */
const replaceLegacyVimeoShortCode: RegexOptions = {
  name: 'legacy-vimeo-short-code',
  regex: legacyVimeoRegex,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<${VimeoMarkdownExtension.tagName} id="${match}"></${VimeoMarkdownExtension.tagName}>`
  }
}

export const replaceLegacyVimeoShortCodeMarkdownItPlugin: MarkdownIt.PluginSimple = (markdownIt: MarkdownIt) =>
  markdownItRegex(markdownIt, replaceLegacyVimeoShortCode)
