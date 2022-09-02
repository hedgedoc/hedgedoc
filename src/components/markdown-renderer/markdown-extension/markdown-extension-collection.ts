/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { MarkdownExtension } from './markdown-extension'
import type { ComponentReplacer } from '../replace-components/component-replacer'
import type { Document } from 'domhandler'
import type MarkdownIt from 'markdown-it'
import { SanitizerMarkdownExtension } from './sanitizer/sanitizer-markdown-extension'

/**
 * Contains multiple {@link MarkdownExtension} and uses them to configure parts of the renderer.
 */
export class MarkdownExtensionCollection {
  private extensions: MarkdownExtension[]

  public constructor(additionalExtensions: MarkdownExtension[]) {
    const tagWhiteLists = additionalExtensions.flatMap((extension) => extension.buildTagNameAllowList())

    this.extensions = [...additionalExtensions, new SanitizerMarkdownExtension(tagWhiteLists)]
  }

  /**
   * Configures the given {@link MarkdownIt markdown-it instance} using every saved {@link MarkdownExtension extension}.
   *
   * @param markdownIt The markdown-it instance to configure.
   */
  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    this.extensions.forEach((extension) => markdownIt.use((markdownIt) => extension.configureMarkdownIt(markdownIt)))
    this.extensions.forEach((extension) =>
      markdownIt.use((markdownIt) => extension.configureMarkdownItPost(markdownIt))
    )
  }

  /**
   * Creates a node processor that applies the node processor of every saved {@link MarkdownExtension extension}.
   *
   * @return the created node processor function
   */
  public buildFlatNodeProcessor(): (document: Document) => Document {
    return this.extensions
      .flatMap((extension) => extension.buildNodeProcessors())
      .reduce(
        (state, processor) => (document: Document) => state(processor.process(document)),
        (document: Document) => document
      )
  }

  /**
   * Collects all {@link ComponentReplacer component replacers} from all saved {@link MarkdownExtension extension}.
   */
  public buildReplacers(): ComponentReplacer[] {
    return this.extensions.flatMap((extension) => extension.buildReplacers())
  }
}
