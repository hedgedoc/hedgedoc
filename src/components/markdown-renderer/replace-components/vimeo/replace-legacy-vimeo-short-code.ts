/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RegexOptions } from '../../../../external-types/markdown-it-regex/interface'

export const replaceLegacyVimeoShortCode: RegexOptions = {
  name: 'legacy-vimeo-short-code',
  regex: /^{%vimeo ([\d]{6,11}) ?%}$/,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<app-vimeo id="${match}"></app-vimeo>`
  }
}
