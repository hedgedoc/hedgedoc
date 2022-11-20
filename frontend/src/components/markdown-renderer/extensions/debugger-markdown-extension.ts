/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownRendererExtension } from './base/markdown-renderer-extension'
import type MarkdownIt from 'markdown-it'
import { Logger } from '../../../utils/logger'
import { isDevMode } from '../../../utils/test-modes'

const log = new Logger('DebuggerMarkdownExtension')

/**
 * Adds console debug logging to the markdown rendering.
 */
export class DebuggerMarkdownExtension extends MarkdownRendererExtension {
  public configureMarkdownItPost(markdownIt: MarkdownIt): void {
    if (isDevMode) {
      markdownIt.core.ruler.push('printStateToConsole', (state) => {
        log.debug('Current state', state)
        return false
      })
    }
  }
}
