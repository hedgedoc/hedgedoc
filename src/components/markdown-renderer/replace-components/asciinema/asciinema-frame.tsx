/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { OneClickEmbedding } from '../one-click-frame/one-click-embedding'
import type { IdProps } from '../custom-tag-with-id-component-replacer'

export const AsciinemaFrame: React.FC<IdProps> = ({ id }) => {
  return (
    <OneClickEmbedding
      containerClassName={'embed-responsive embed-responsive-16by9'}
      previewContainerClassName={'embed-responsive-item'}
      hoverIcon={'play'}
      loadingImageUrl={`https://asciinema.org/a/${id}.png`}>
      <iframe
        className='embed-responsive-item'
        title={`asciinema cast ${id}`}
        src={`https://asciinema.org/a/${id}/embed?autoplay=1`}
      />
    </OneClickEmbedding>
  )
}
