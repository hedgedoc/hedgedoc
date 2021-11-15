/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from './markdown-extension'
import type MarkdownIt from 'markdown-it'
import markdownItContainer from 'markdown-it-container'
import type Token from 'markdown-it/lib/token'
import { escapeHtml } from 'markdown-it/lib/common/utils'

export class SpoilerMarkdownExtension extends MarkdownExtension {
  private static readonly spoilerRegEx = /^spoiler\s+(.*)$/

  private createSpoilerContainer(): (tokens: Token[], index: number) => void {
    return (tokens: Token[], index: number) => {
      const matches = SpoilerMarkdownExtension.spoilerRegEx.exec(tokens[index].info.trim())

      if (tokens[index].nesting === 1 && matches && matches[1]) {
        // opening tag
        return `<details><summary>${escapeHtml(matches[1])}</summary>`
      } else {
        // closing tag
        return '</details>\n'
      }
    }
  }

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    markdownItContainer(markdownIt, 'spoiler', {
      validate: (params: string) => SpoilerMarkdownExtension.spoilerRegEx.test(params),
      render: () => this.createSpoilerContainer()
    })
  }
}
