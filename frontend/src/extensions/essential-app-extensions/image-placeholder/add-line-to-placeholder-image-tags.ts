/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ImagePlaceholderMarkdownExtension } from './image-placeholder-markdown-extension'
import type MarkdownIt from 'markdown-it/lib'

/**
 * A {@link MarkdownIt.PluginSimple markdown it plugin} that adds the line number of the markdown code to every placeholder image.
 *
 * @param markdownIt The markdown it instance to which the plugin should be added
 */
export const addLineToPlaceholderImageTags: MarkdownIt.PluginSimple = (markdownIt: MarkdownIt) => {
  markdownIt.core.ruler.push('image-placeholder', (state) => {
    state.tokens.forEach((token) => {
      if (token.type !== 'inline') {
        return
      }
      token.children?.forEach((childToken) => {
        if (
          childToken.type === 'image' &&
          childToken.attrGet('src') === ImagePlaceholderMarkdownExtension.PLACEHOLDER_URL
        ) {
          const line = token.map?.[0]
          if (line !== undefined) {
            childToken.attrSet('data-line', String(line))
          }
        }
      })
    })
    return true
  })
}
