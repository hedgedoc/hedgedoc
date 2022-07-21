/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type MarkdownIt from 'markdown-it'
import type { NodeProcessor } from '../node-preprocessors/node-processor'
import type { ComponentReplacer } from '../replace-components/component-replacer'

/**
 * Base class for Markdown extensions.
 */
export abstract class MarkdownExtension {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public configureMarkdownItPost(markdownIt: MarkdownIt): void {
    return
  }

  public buildNodeProcessors(): NodeProcessor[] {
    return []
  }

  public buildReplacers(): ComponentReplacer[] {
    return []
  }

  public buildTagNameWhitelist(): string[] {
    return []
  }
}
