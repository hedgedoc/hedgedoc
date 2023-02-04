/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ClickShield } from '../../../components/markdown-renderer/replace-components/click-shield/click-shield'
import type { IdProps } from '../../../components/markdown-renderer/replace-components/custom-tag-with-id-component-replacer'
import React from 'react'

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
      containerClassName={''}
      data-cypress-id={'click-shield-asciinema'}>
      <span className={'ratio ratio-16x9'}>
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
