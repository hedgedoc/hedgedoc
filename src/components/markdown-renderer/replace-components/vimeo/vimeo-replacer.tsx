import { DomElement } from 'domhandler'
import React from 'react'
import { getAttributesFromHedgeDocTag } from '../utils'
import { ComponentReplacer } from '../ComponentReplacer'
import { VimeoFrame } from './vimeo-frame'

export class VimeoReplacer extends ComponentReplacer {
  private counterMap: Map<string, number> = new Map<string, number>()

  public getReplacement (node: DomElement, index: number): React.ReactElement | undefined {
    const attributes = getAttributesFromHedgeDocTag(node, 'vimeo')
    if (attributes && attributes.id) {
      const videoId = attributes.id
      const count = (this.counterMap.get(videoId) || 0) + 1
      this.counterMap.set(videoId, count)
      return <VimeoFrame key={index} id={videoId}/>
    }
  }
}
