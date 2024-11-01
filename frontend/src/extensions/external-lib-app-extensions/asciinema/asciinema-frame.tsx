/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ClickShield } from '../../../components/markdown-renderer/replace-components/click-shield/click-shield'
import type { IdProps } from '../../../components/markdown-renderer/replace-components/custom-tag-with-id-component-replacer'
import React from 'react'
import { Play as IconPlay } from 'react-bootstrap-icons'

/**
 * Renders an embedding for https://asciinema.org
 *
 * @param id The id from the asciinema url
 */
export const AsciinemaFrame: React.FC<IdProps> = ({ id }) => {
  return (
    <ClickShield
      hoverIcon={IconPlay}
      targetDescription={'asciinema'}
      fallbackPreviewImageUrl={`https://asciinema.org/a/${id}.png`}
      fallbackBackgroundColor={'#d40000'}
      containerClassName={''}
      fallbackLink={`https://asciinema.org/a/${id}`}
      data-cypress-id={'click-shield-asciinema'}>
      <span className={'ratio ratio-16x9 d-print-none'}>
        <iframe
          allowFullScreen={true}
          className=''
          title={`asciinema cast ${id}`}
          src={`https://asciinema.org/a/${id}/iframe?autoplay=1`}
        />
      </span>
    </ClickShield>
  )
}
