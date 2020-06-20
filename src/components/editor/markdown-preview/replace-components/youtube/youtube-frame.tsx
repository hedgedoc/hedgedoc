import React from 'react'
import { ComponentReplacer } from '../../markdown-preview'
import { OneClickEmbedding } from '../one-click-frame/one-click-embedding'
import { getIdFromCodiMdTag, VideoFrameProps } from '../video-util'

const getElementReplacement: ComponentReplacer = (node, counterMap) => {
  const videoId = getIdFromCodiMdTag(node, 'youtube')
  if (videoId) {
    const count = (counterMap.get(videoId) || 0) + 1
    counterMap.set(videoId, count)
    return <YouTubeFrame key={`youtube_${videoId}_${count}`} id={videoId}/>
  }
}

export const YouTubeFrame: React.FC<VideoFrameProps> = ({ id }) => {
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
