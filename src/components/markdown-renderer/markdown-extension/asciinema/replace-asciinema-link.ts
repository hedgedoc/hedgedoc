/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RegexOptions } from '../../../../external-types/markdown-it-regex/interface'
import { AsciinemaMarkdownExtension } from './asciinema-markdown-extension'

const protocolRegex = /(?:http(?:s)?:\/\/)?/
const domainRegex = /(?:asciinema\.org\/a\/)/
const idRegex = /(\d+)/
const tailRegex = /(?:[./?#].*)?/
const asciinemaUrlRegex = new RegExp(
  `^(?:${protocolRegex.source}${domainRegex.source}${idRegex.source}${tailRegex.source})$`,
  'i'
)

export const replaceAsciinemaLink: RegexOptions = {
  name: 'asciinema-link',
  regex: asciinemaUrlRegex,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<${AsciinemaMarkdownExtension.tagName} id='${match}'></${AsciinemaMarkdownExtension.tagName}>`
  }
}
