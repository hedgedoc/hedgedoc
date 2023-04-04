/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useFrontendConfig } from '../frontend-config-context/use-frontend-config'
import { ShowIf } from '../show-if/show-if'
import styles from './branding.module.scss'
import React, { useMemo } from 'react'

export interface BrandingProps {
  inline?: boolean
  delimiter?: boolean
}

/**
 * Show the branding of the HedgeDoc instance.
 * This branding can either be a text, a logo or both (in that case the text is used as the title and alt of the image).
 *
 * @param inline If the logo should be using the inline-size or the regular-size css class.
 * @param delimiter If the delimiter between the HedgeDoc logo and the branding should be shown.
 */
export const Branding: React.FC<BrandingProps> = ({ inline = false, delimiter = true }) => {
  const branding = useFrontendConfig().branding
  const showBranding = !!branding.name || !!branding.logo

  const brandingDom = useMemo(() => {
    if (branding.logo) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={branding.logo}
          alt={branding.name}
          title={branding.name}
          className={inline ? styles['inline-size'] : styles['regular-size']}
        />
      )
    } else {
      return branding.name
    }
  }, [branding.logo, branding.name, inline])

  return (
    <ShowIf condition={showBranding}>
      <ShowIf condition={delimiter}>
        <strong className={`mx-1 ${inline ? styles['inline-size'] : styles['regular-size']}`}>@</strong>
      </ShowIf>
      {brandingDom}
    </ShowIf>
  )
}
