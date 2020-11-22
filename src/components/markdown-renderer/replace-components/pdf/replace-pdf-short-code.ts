/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { RegexOptions } from '../../../../external-types/markdown-it-regex/interface'

export const replacePdfShortCode: RegexOptions = {
  name: 'pdf-short-code',
  regex: /^{%pdf (.*) ?%}$/,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<app-pdf url="${match}"></app-pdf>`
  }
}
