/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import yaml from 'js-yaml'
import MarkdownIt from 'markdown-it'
import frontmatter from 'markdown-it-front-matter'
import { RawNoteFrontmatter } from '../../editor-page/note-frontmatter/note-frontmatter'

interface FrontmatterPluginOptions {
  onParseError: (error: boolean) => void,
  onRawMeta: (rawMeta: RawNoteFrontmatter) => void,
}

export const frontmatterExtract: MarkdownIt.PluginWithOptions<FrontmatterPluginOptions> = (markdownIt: MarkdownIt, options) => {
  if (!options) {
    return
  }
  frontmatter(markdownIt, (rawMeta: string) => {
    try {
      const meta: RawNoteFrontmatter = yaml.load(rawMeta) as RawNoteFrontmatter
      options.onParseError(false)
      options.onRawMeta(meta)
    } catch (e) {
      console.error(e)
      options.onParseError(true)
      options.onRawMeta({} as RawNoteFrontmatter)
    }
  })
}
