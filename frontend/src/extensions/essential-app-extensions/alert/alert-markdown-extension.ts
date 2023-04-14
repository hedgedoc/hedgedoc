/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import type MarkdownIt from 'markdown-it'
import markdownItContainer from 'markdown-it-container'
import type Renderer from 'markdown-it/lib/renderer'
import type Token from 'markdown-it/lib/token'

export const alertLevels = ['success', 'danger', 'info', 'warning']

/**
 * Adds alert boxes to the markdown rendering.
 */
export class AlertMarkdownExtension extends MarkdownRendererExtension {
  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    alertLevels.forEach((level) => {
      markdownItContainer(markdownIt, level, {
        render: (tokens: Token[], index: number, options: MarkdownIt.Options, env: unknown, self: Renderer) => {
          tokens[index].attrJoin('role', 'alert')
          tokens[index].attrJoin('class', 'alert')
          tokens[index].attrJoin('class', `alert-${level}`)
          return self.renderToken(tokens, index, options)
        }
      })
    })
  }
}
