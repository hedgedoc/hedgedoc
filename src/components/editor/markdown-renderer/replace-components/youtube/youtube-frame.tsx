import React from 'react'
import { ComponentReplacer } from '../../markdown-renderer'
import { getAttributesFromCodiMdTag } from '../codi-md-tag-utils'
import { OneClickEmbedding } from '../one-click-frame/one-click-embedding'

const getElementReplacement: ComponentReplacer = (node, counterMap) => {
  const attributes = getAttributesFromCodiMdTag(node, 'youtube')
  if (attributes && attributes.id) {
    const videoId = attributes.id
    const count = (counterMap.get(videoId) || 0) + 1
    counterMap.set(videoId, count)
    return <YouTubeFrame key={`youtube_${videoId}_${count}`} id={videoId}/>
  }
}

export interface YouTubeFrameProps {
  id: string
}

export const YouTubeFrame: React.FC<YouTubeFrameProps> = ({ id }) => {
  return (
    <OneClickEmbedding containerClassName={'embed-responsive embed-responsive-16by9'}
      previewContainerClassName={'embed-responsive-item'} hoverIcon={'youtube-play'}
      loadingImageUrl={`//i.ytimg.com/vi/${id}/maxresdefault.jpg`}>
      <iframe className='embed-responsive-item' title={`youtube video of ${id}`}
        src={`//www.youtube-nocookie.com/embed/${id}?autoplay=1`}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"/>
    </OneClickEmbedding>
  )
}

export { getElementReplacement as getYouTubeReplacement }
