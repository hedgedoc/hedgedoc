/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import { OneClickEmbedding } from '../one-click-frame/one-click-embedding'

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
