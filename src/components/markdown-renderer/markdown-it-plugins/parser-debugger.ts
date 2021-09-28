/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import MarkdownIt from 'markdown-it/lib'
import { Logger } from '../../../utils/logger'

const log = new Logger('MarkdownItParserDebugger')

export const MarkdownItParserDebugger: MarkdownIt.PluginSimple = (md: MarkdownIt) => {
  if (process.env.NODE_ENV !== 'production') {
    md.core.ruler.push('test', (state) => {
      log.debug('Current state', state)
      return false
    })
  }
}
