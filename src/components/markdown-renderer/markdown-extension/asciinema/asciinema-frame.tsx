/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import type { IdProps } from '../../replace-components/custom-tag-with-id-component-replacer'
import { ClickShield } from '../../replace-components/click-shield/click-shield'

/**
 * Renders an embedding for https://asciinema.org
 *
 * @param id The id from the asciinema url
 */
export const AsciinemaFrame: React.FC<IdProps> = ({ id }) => {
  return (
    <ClickShield
      hoverIcon={'play'}
      targetDescription={'asciinema'}
      fallbackPreviewImageUrl={`https://asciinema.org/a/${id}.png`}
      fallbackBackgroundColor={'#d40000'}
      data-cypress-id={'click-shield-asciinema'}>
      <span className={'embed-responsive embed-responsive-16by9'}>
        <iframe
          className='embed-responsive-item'
          title={`asciinema cast ${id}`}
          src={`https://asciinema.org/a/${id}/embed?autoplay=1`}
        />
      </span>
    </ClickShield>
  )
}
