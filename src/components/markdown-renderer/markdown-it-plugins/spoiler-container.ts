/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import MarkdownIt from 'markdown-it'
import { escapeHtml } from 'markdown-it/lib/common/utils'
import markdownItContainer from 'markdown-it-container'
import Token from 'markdown-it/lib/token'
import { MarkdownItPlugin } from '../replace-components/ComponentReplacer'
import { RenderContainerReturn } from './alert-container'

export const spoilerRegEx = /^spoiler\s+(.*)$/

const createSpoilerContainer = (): RenderContainerReturn => {
  return (tokens: Token[], index: number) => {
    const matches = spoilerRegEx.exec(tokens[index].info.trim())

    if (tokens[index].nesting === 1 && matches && matches[1]) {
      // opening tag
      return `<details><summary>${ escapeHtml(matches[1]) }</summary>`

    } else {
      // closing tag
      return '</details>\n'
    }
  }
}

export const spoilerContainer: MarkdownItPlugin = (markdownIt: MarkdownIt) => {
  markdownItContainer(markdownIt, 'spoiler', {
    validate: (params: string) => spoilerRegEx.test(params),
    render: createSpoilerContainer()
  })
}
