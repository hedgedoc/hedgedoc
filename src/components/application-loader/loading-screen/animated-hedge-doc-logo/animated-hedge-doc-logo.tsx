/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import LogoColor from '../../../common/hedge-doc-logo/logo_color.svg'
import styles from './animations.module.scss'

export interface HedgeDocLogoProps {
  animation: AnimationType
}

export enum AnimationType {
  JUMP = 'animation-jump',
  SHAKE = 'animation-shake'
}

/**
 * Shows an animated hedgedoc logo.
 *
 * @param animation The name of the animation
 */
export const AnimatedHedgeDocLogo: React.FC<HedgeDocLogoProps> = ({ animation }) => {
  return (
    <LogoColor
      className={`w-auto ${styles[animation]}`}
      title={'HedgeDoc logo'}
      alt={'HedgeDoc logo'}
      height={256}
      width={256}
    />
  )
}
