import { DomElement } from 'domhandler'
import MarkdownIt from 'markdown-it'
import markdownItRegex from 'markdown-it-regex'
import React from 'react'
import { replaceGistLink } from './replace-gist-link'
import { replaceLegacyGistShortCode } from './replace-legacy-gist-short-code'
import { getAttributesFromHedgeDocTag } from '../utils'
import { ComponentReplacer } from '../ComponentReplacer'
import { OneClickEmbedding } from '../one-click-frame/one-click-embedding'
import { GistFrame } from './gist-frame'
import preview from './gist-preview.png'

export class GistReplacer extends ComponentReplacer {
  private counterMap: Map<string, number> = new Map<string, number>()

  public getReplacement (node: DomElement): React.ReactElement | undefined {
    const attributes = getAttributesFromHedgeDocTag(node, 'gist')
    if (attributes && attributes.id) {
      const gistId = attributes.id
      const count = (this.counterMap.get(gistId) || 0) + 1
      this.counterMap.set(gistId, count)
      return (
        <OneClickEmbedding previewContainerClassName={'gist-frame'} loadingImageUrl={preview} hoverIcon={'github'} tooltip={'click to load gist'}>
          <GistFrame id={gistId}/>
        </OneClickEmbedding>
      )
    }
  }

  public static readonly markdownItPlugin: MarkdownIt.PluginSimple = (markdownIt) => {
    markdownItRegex(markdownIt, replaceGistLink)
    markdownItRegex(markdownIt, replaceLegacyGistShortCode)
  }
}
