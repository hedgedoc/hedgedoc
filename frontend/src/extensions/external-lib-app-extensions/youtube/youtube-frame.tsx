/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ClickShield } from '../../../components/markdown-renderer/replace-components/click-shield/click-shield'
import type { IdProps } from '../../../components/markdown-renderer/replace-components/custom-tag-with-id-component-replacer'
import React from 'react'
import { Youtube as IconYoutube } from 'react-bootstrap-icons'

/**
 * Renders a video player embedding for https://youtube.com
 *
 * @param id The id from the youtube video url
 */
export const YouTubeFrame: React.FC<IdProps> = ({ id }) => {
  return (
    <ClickShield
      hoverIcon={IconYoutube}
      targetDescription={'YouTube'}
      fallbackPreviewImageUrl={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
      fallbackLink={`https://www.youtube.com/watch?v=${id}`}
      fallbackBackgroundColor={'#ff0000'}
      data-cypress-id={'click-shield-youtube'}>
      <span className={'ratio ratio-16x9 d-inline-block d-print-none'}>
        <iframe
          title={`youtube video of ${id}`}
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
        />
      </span>
    </ClickShield>
  )
}
