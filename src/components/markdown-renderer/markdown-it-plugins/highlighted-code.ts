/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type MarkdownIt from 'markdown-it/lib'

const highlightRegex = /^ *([\w-]*)(.*)$/

export const highlightedCode: MarkdownIt.PluginSimple = (md: MarkdownIt) => {
  md.core.ruler.push('highlighted-code', (state) => {
    state.tokens.forEach((token) => {
      if (token.type === 'fence') {
        const highlightInfos = highlightRegex.exec(token.info)
        if (!highlightInfos) {
          return
        }
        if (highlightInfos[1]) {
          token.attrJoin('data-highlight-language', highlightInfos[1])
        }
        if (highlightInfos[2]) {
          token.attrJoin('data-extra', highlightInfos[2])
        }
      }
    })
    return true
  })
}
