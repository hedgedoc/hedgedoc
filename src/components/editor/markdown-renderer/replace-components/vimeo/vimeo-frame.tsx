import React, { useCallback } from 'react'
import { OneClickEmbedding } from '../one-click-frame/one-click-embedding'

interface VimeoApiResponse {
  // Vimeo uses strange names for their fields. ESLint doesn't like that.
  // eslint-disable-next-line camelcase
  thumbnail_large?: string
}

export interface VimeoFrameProps {
  id: string
}

export const VimeoFrame: React.FC<VimeoFrameProps> = ({ id }) => {
  const getPreviewImageLink = useCallback(async () => {
    const response = await fetch(`https://vimeo.com/api/v2/video/${id}.json`, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    })
    if (response.status !== 200) {
      throw new Error('Error while loading data from vimeo api')
    }
    const vimeoResponse: VimeoApiResponse[] = await response.json() as VimeoApiResponse[]

    if (vimeoResponse[0] && vimeoResponse[0].thumbnail_large) {
      return vimeoResponse[0].thumbnail_large
    } else {
      throw new Error('Invalid vimeo response')
    }
  }, [id])

  return (
    <OneClickEmbedding containerClassName={'embed-responsive embed-responsive-16by9'} previewContainerClassName={'embed-responsive-item'} loadingImageUrl={'https://i.vimeocdn.com/video/'} hoverIcon={'vimeo-square'}
      onImageFetch={getPreviewImageLink}>
      <iframe className='embed-responsive-item' title={`vimeo video of ${id}`}
        src={`https://player.vimeo.com/video/${id}?autoplay=1`}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"/>
    </OneClickEmbedding>
  )
}
