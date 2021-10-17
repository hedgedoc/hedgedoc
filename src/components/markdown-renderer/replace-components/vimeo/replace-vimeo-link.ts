/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RegexOptions } from '../../../../external-types/markdown-it-regex/interface'

const protocolRegex = /(?:http(?:s)?:\/\/)?/
const domainRegex = /(?:player\.)?(?:vimeo\.com\/)(?:(?:channels|album|ondemand|groups)\/\w+\/)?(?:video\/)?/
const idRegex = /([\d]{6,11})/
const tailRegex = /(?:[?#].*)?/
const vimeoVideoUrlRegex = new RegExp(
  `(?:${protocolRegex.source}${domainRegex.source}${idRegex.source}${tailRegex.source})`
)
const linkRegex = new RegExp(`^${vimeoVideoUrlRegex.source}$`, 'i')

export const replaceVimeoLink: RegexOptions = {
  name: 'vimeo-link',
  regex: linkRegex,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<app-vimeo id="${match}"></app-vimeo>`
  }
}
