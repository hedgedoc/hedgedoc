/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import anchor from '@mrdrogdrog/markdown-it-anchor'
import MarkdownIt from 'markdown-it'

export const headlineAnchors: MarkdownIt.PluginSimple = (markdownIt) => {
  // noinspection CheckTagEmptyBody
  anchor(markdownIt, {
    permalink: true,
    permalinkBefore: true,
    permalinkClass: 'heading-anchor text-dark',
    permalinkSymbol: '<i class="fa fa-link"></i>'
  })
}
