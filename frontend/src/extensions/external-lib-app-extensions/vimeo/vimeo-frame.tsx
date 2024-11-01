/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ClickShield } from '../../../components/markdown-renderer/replace-components/click-shield/click-shield'
import type { IdProps } from '../../../components/markdown-renderer/replace-components/custom-tag-with-id-component-replacer'
import React, { useCallback } from 'react'
import { Vimeo as IconVimeo } from 'react-bootstrap-icons'

interface VimeoApiResponse {
  // Vimeo uses strange names for their fields. ESLint doesn't like that.
  // eslint-disable-next-line camelcase
  thumbnail_large?: string
}

/**
 * Renders a video player embedding for https://vimeo.com
 *
 * @param id The id from the vimeo video url
 */
export const VimeoFrame: React.FC<IdProps> = ({ id }) => {
  const getPreviewImageLink = useCallback(async () => {
    const response = await fetch(`https://vimeo.com/api/v2/video/${id}.json`, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    })
    if (response.status !== 200) {
      throw new Error('Error while loading data from vimeo api')
    }
    const vimeoResponse: VimeoApiResponse[] = (await response.json()) as VimeoApiResponse[]

    if (vimeoResponse[0] && vimeoResponse[0].thumbnail_large) {
      return vimeoResponse[0].thumbnail_large
    } else {
      throw new Error('Invalid vimeo response')
    }
  }, [id])

  return (
    <ClickShield
      hoverIcon={IconVimeo}
      targetDescription={'Vimeo'}
      onImageFetch={getPreviewImageLink}
      fallbackLink={`https://vimeo.com/${id}`}
      fallbackBackgroundColor={'#00adef'}
      data-cypress-id={'click-shield-vimeo'}>
      <span className={'ratio ratio-16x9 d-inline-block d-print-none'}>
        <iframe
          title={`vimeo video of ${id}`}
          src={`https://player.vimeo.com/video/${id}?autoplay=1`}
          allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
        />
      </span>
    </ClickShield>
  )
}
