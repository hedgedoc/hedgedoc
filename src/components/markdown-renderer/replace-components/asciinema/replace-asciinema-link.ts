/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RegexOptions } from '../../../../external-types/markdown-it-regex/interface'
import type MarkdownIt from 'markdown-it/lib'
import markdownItRegex from 'markdown-it-regex'

const protocolRegex = /(?:http(?:s)?:\/\/)?/
const domainRegex = /(?:asciinema\.org\/a\/)/
const idRegex = /(\d+)/
const tailRegex = /(?:[./?#].*)?/
const gistUrlRegex = new RegExp(`(?:${protocolRegex.source}${domainRegex.source}${idRegex.source}${tailRegex.source})`)
const linkRegex = new RegExp(`^${gistUrlRegex.source}$`, 'i')

export const asciinemaMarkdownItPlugin: MarkdownIt.PluginSimple = (markdownIt: MarkdownIt) => {
  markdownItRegex(markdownIt, replaceAsciinemaLink)
}

export const replaceAsciinemaLink: RegexOptions = {
  name: 'asciinema-link',
  regex: linkRegex,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<app-asciinema id="${match}"></app-asciinema>`
  }
}
