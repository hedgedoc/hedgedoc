/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import MarkdownIt from 'markdown-it/lib'

export const MarkdownItParserDebugger: MarkdownIt.PluginSimple = (md: MarkdownIt) => {
  if (process.env.NODE_ENV !== 'production') {
    md.core.ruler.push('test', (state) => {
      console.log(state)
      return true
    })
  }
}
