/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RegexOptions } from '../../../external-types/markdown-it-regex/interface'
import { GistMarkdownExtension } from './gist-markdown-extension'

const linkRegex = /^(?:https?:\/\/)?gist\.github\.com\/(\w+\/\w+)(?:[./?#].*)?$/i

/**
 * Replacer for gist links.
 */
export const replaceGistLink: RegexOptions = {
  name: 'gist-link',
  regex: linkRegex,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<${GistMarkdownExtension.tagName} id='${match}'></${GistMarkdownExtension.tagName}>`
  }
}
