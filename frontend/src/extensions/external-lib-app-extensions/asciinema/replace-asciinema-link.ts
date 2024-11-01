/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RegexOptions } from '../../../external-types/markdown-it-regex/interface'
import { AsciinemaMarkdownExtension } from './asciinema-markdown-extension'
import type MarkdownIt from 'markdown-it'
import markdownItRegex from 'markdown-it-regex'

const asciinemaUrlRegex = /^https?:\/\/asciinema\.org\/a\/(\d+)(?:\?.*)?$/i

const replaceAsciinemaLink: RegexOptions = {
  name: 'asciinema-link',
  regex: asciinemaUrlRegex,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<${AsciinemaMarkdownExtension.tagName} id='${match}'></${AsciinemaMarkdownExtension.tagName}>`
  }
}

/**
 * Replacer for asciinema links.
 */
export const replaceAsciinemaLinkMarkdownItPlugin: MarkdownIt.PluginSimple = (markdownIt: MarkdownIt) =>
  markdownItRegex(markdownIt, replaceAsciinemaLink)
