/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { concatCssClasses } from '../../../utils/concat-css-classes'
import styles from './branding.module.scss'
import { useBrandingDetails } from './use-branding-details'
import React, { useMemo } from 'react'

export interface BrandingProps {
  inline?: boolean
}

/**
 * Show the branding of the HedgeDoc instance.
 * This branding can either be a text, a logo or both (in that case the text is used as the title and alt of the image).
 *
 * @param inline If the logo should be using the inline-size or the regular-size css class.
 */
export const CustomBranding: React.FC<BrandingProps> = ({ inline = false }) => {
  const branding = useBrandingDetails()

  const className = useMemo(
    () =>
      concatCssClasses({
        [styles['regular-size']]: !inline,
        [styles['inline-logo']]: inline && branding && !!branding.logo,
        [styles['inline-text']]: inline && branding && !branding.logo
      }),
    [inline, branding]
  )

  if (!branding) {
    return null
  } else if (branding.logo) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={branding.logo}
        alt={branding.name !== null ? branding.name : undefined}
        title={branding.name !== null ? branding.name : undefined}
        className={className}
      />
    )
  } else {
    return <span className={className}>{branding.name}</span>
  }
}
