/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { ShowIf } from '../show-if/show-if'
import styles from './branding.module.scss'
import { useApplicationState } from '../../../hooks/common/use-application-state'

export interface BrandingProps {
  inline?: boolean
  delimiter?: boolean
}

export const Branding: React.FC<BrandingProps> = ({ inline = false, delimiter = true }) => {
  const branding = useApplicationState((state) => state.config.branding)
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
