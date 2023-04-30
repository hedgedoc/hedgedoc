/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useFrontendConfig } from '../frontend-config-context/use-frontend-config'
import styles from './branding.module.scss'
import React from 'react'

export interface BrandingProps {
  inline?: boolean
}

/**
 * Show the branding of the HedgeDoc instance.
 * This branding can either be a text, a logo or both (in that case the text is used as the title and alt of the image).
 *
 * @param inline If the logo should be using the inline-size or the regular-size css class.
 * @param delimiter If the delimiter between the HedgeDoc logo and the branding should be shown.
 */
export const CustomBranding: React.FC<BrandingProps> = ({ inline = false }) => {
  const branding = useFrontendConfig().branding

  if (!branding.name && !branding.logo) {
    return null
  } else if (branding.logo) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={branding.logo}
        alt={branding.name}
        title={branding.name}
        className={inline ? styles['inline-size'] : styles['regular-size']}
      />
    )
  } else {
    return <span className={inline ? styles['inline-size'] : styles['regular-size']}>{branding.name}</span>
  }
}
