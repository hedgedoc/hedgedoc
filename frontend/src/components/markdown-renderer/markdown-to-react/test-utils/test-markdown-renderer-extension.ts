/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MarkdownRendererExtension } from '../../extensions/_base-classes/markdown-renderer-extension'
import type { NodeProcessor } from '../../node-preprocessors/node-processor'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { TestNodeProcessor } from './test-node-processor'
import { TestReplacer } from './test-replacer'
import type MarkdownIt from 'markdown-it'
import Token from 'markdown-it/lib/token'

export class TestMarkdownRendererExtension extends MarkdownRendererExtension {
  constructor(private doAfterCallback: () => void) {
    super()
  }

  buildNodeProcessors(): NodeProcessor[] {
    return [new TestNodeProcessor()]
  }

  configureMarkdownIt(markdownIt: MarkdownIt) {
    markdownIt.use(() => {
      markdownIt.core.ruler.push('configure', (core) => core.tokens.push(new Token('configure', 'configure', 0)))
      markdownIt.renderer.rules.configure = () => '<span>configure</span>'
    })
  }

  buildReplacers(): ComponentReplacer[] {
    return [new TestReplacer()]
  }

  buildTagNameAllowList(): string[] {
    return ['node-processor']
  }

  configureMarkdownItPost(markdownIt: MarkdownIt) {
    markdownIt.use(() => {
      markdownIt.core.ruler.push('post', (core) => core.tokens.push(new Token('post', 'post', 0)))
      markdownIt.renderer.rules.post = () => '<span>post</span>'
    })
  }

  doAfterRendering() {
    this.doAfterCallback()
  }
}
