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
  private counterMap: Map<string, number> = new Map<string, number>()

  public getReplacement (node: DomElement): React.ReactElement | undefined {
    const attributes = getAttributesFromHedgeDocTag(node, 'vimeo')
    if (attributes && attributes.id) {
      const videoId = attributes.id
      const count = (this.counterMap.get(videoId) || 0) + 1
      this.counterMap.set(videoId, count)
      return <VimeoFrame id={videoId}/>
    }
  }

  public static readonly markdownItPlugin: MarkdownIt.PluginSimple = (markdownIt) => {
    markdownItRegex(markdownIt, replaceVimeoLink)
    markdownItRegex(markdownIt, replaceLegacyVimeoShortCode)
  }
}
