/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import type MarkdownIt from 'markdown-it'
import markdownItContainer from 'markdown-it-container'
import { escapeHtml } from 'markdown-it/lib/common/utils'
import type Token from 'markdown-it/lib/token'

/**
 * Adds support for html spoiler tags.
 *
 * @see https://www.w3schools.com/tags/tag_details.asp
 */
export class SpoilerMarkdownExtension extends MarkdownRendererExtension {
  private static readonly spoilerRegEx = /^spoiler\s+(.*)$/

  private static renderSpoilerContainer(tokens: Token[], index: number): string {
    const matches = SpoilerMarkdownExtension.spoilerRegEx.exec(tokens[index].info.trim())

    return tokens[index].nesting === 1 && matches && matches[1]
      ? `<details><summary>${escapeHtml(matches[1])}</summary>`
      : '</details>\n'
  }

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    markdownItContainer(markdownIt, 'spoiler', {
      validate: (params: string) => SpoilerMarkdownExtension.spoilerRegEx.test(params),
      render: SpoilerMarkdownExtension.renderSpoilerContainer.bind(this)
    })
  }
}
