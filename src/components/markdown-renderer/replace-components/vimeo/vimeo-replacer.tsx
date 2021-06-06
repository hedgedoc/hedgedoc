/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DomElement } from 'domhandler'
import MarkdownIt from 'markdown-it'
import markdownItRegex from 'markdown-it-regex'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import { getAttributesFromHedgeDocTag } from '../utils'
import { replaceLegacyVimeoShortCode } from './replace-legacy-vimeo-short-code'
import { replaceVimeoLink } from './replace-vimeo-link'
import { VimeoFrame } from './vimeo-frame'

export class VimeoReplacer extends ComponentReplacer {
  public static readonly markdownItPlugin: MarkdownIt.PluginSimple = (markdownIt) => {
    markdownItRegex(markdownIt, replaceVimeoLink)
    markdownItRegex(markdownIt, replaceLegacyVimeoShortCode)
  }

  public getReplacement(node: DomElement): React.ReactElement | undefined {
    const attributes = getAttributesFromHedgeDocTag(node, 'vimeo')
    if (attributes && attributes.id) {
      const videoId = attributes.id
      return <VimeoFrame id={videoId} />
    }
  }
}
