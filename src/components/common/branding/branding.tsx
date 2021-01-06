/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import equal from 'fast-deep-equal'
import React from 'react'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../redux'
import { ShowIf } from '../show-if/show-if'
import './branding.scss'

export interface BrandingProps {
  inline?: boolean
  delimiter?: boolean
}

export const Branding: React.FC<BrandingProps> = ({ inline = false, delimiter = true }) => {
  const branding = useSelector((state: ApplicationState) => state.config.branding, equal)
  const showBranding = !!branding.name || !!branding.logo

  return (
    <ShowIf condition={showBranding}>
      <ShowIf condition={delimiter}>
        <strong className={`mx-1 ${inline ? 'inline-size' : 'regular-size'}`}>@</strong>
      </ShowIf>
      {
        branding.logo
          ? <img
              src={branding.logo}
              alt={branding.name}
              title={branding.name}
              className={inline ? 'inline-size' : 'regular-size'}
            />
          : branding.name
      }
    </ShowIf>
  )
}
