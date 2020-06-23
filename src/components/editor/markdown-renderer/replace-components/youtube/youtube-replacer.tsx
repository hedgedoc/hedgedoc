import { DomElement } from 'domhandler'
import React from 'react'
import { getAttributesFromCodiMdTag } from '../codi-md-tag-utils'
import { ComponentReplacer } from '../ComponentReplacer'
import { YouTubeFrame } from './youtube-frame'

export class YoutubeReplacer implements ComponentReplacer {
  private counterMap: Map<string, number> = new Map<string, number>()

  getReplacement (node: DomElement): React.ReactElement | undefined {
    const attributes = getAttributesFromCodiMdTag(node, 'youtube')
    if (attributes && attributes.id) {
      const videoId = attributes.id
      const count = (this.counterMap.get(videoId) || 0) + 1
      this.counterMap.set(videoId, count)
      return <YouTubeFrame key={`youtube_${videoId}_${count}`} id={videoId}/>
    }
  }
}
