/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import { DomElement } from 'domhandler'
import MarkdownIt from 'markdown-it'
import markdownItRegex from 'markdown-it-regex'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import { getAttributesFromHedgeDocTag } from '../utils'
import { replaceLegacyYoutubeShortCode } from './replace-legacy-youtube-short-code'
import { replaceYouTubeLink } from './replace-youtube-link'
import { YouTubeFrame } from './youtube-frame'

export class YoutubeReplacer extends ComponentReplacer {
  private counterMap: Map<string, number> = new Map<string, number>()

  public getReplacement (node: DomElement): React.ReactElement | undefined {
    const attributes = getAttributesFromHedgeDocTag(node, 'youtube')
    if (attributes && attributes.id) {
      const videoId = attributes.id
      const count = (this.counterMap.get(videoId) || 0) + 1
      this.counterMap.set(videoId, count)
      return <YouTubeFrame id={videoId}/>
    }
  }

  public static readonly markdownItPlugin: MarkdownIt.PluginSimple = (markdownIt) => {
    markdownItRegex(markdownIt, replaceYouTubeLink)
    markdownItRegex(markdownIt, replaceLegacyYoutubeShortCode)
  }
}
