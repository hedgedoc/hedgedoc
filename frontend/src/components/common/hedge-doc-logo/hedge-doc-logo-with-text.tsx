/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import LogoBwHorizontal from './logo_text_bw_horizontal.svg'
import LogoColorVertical from './logo_text_color_vertical.svg'
import LogoWbHorizontal from './logo_text_wb_horizontal.svg'
import React from 'react'

export enum HedgeDocLogoSize {
  SMALL = 32,
  MEDIUM = 64,
  BIG = 256
}

export interface HedgeDocLogoProps {
  size?: HedgeDocLogoSize | number
  logoType: HedgeDocLogoType
}

export enum HedgeDocLogoType {
  COLOR_VERTICAL,
  BW_HORIZONTAL,
  WB_HORIZONTAL
}

/**
 * Renders the HedgeDoc logo with the app name in different types.
 *
 * @param size The size the logo should have.
 * @param logoType The logo type to be used.
 */
export const HedgeDocLogoWithText: React.FC<HedgeDocLogoProps> = ({ size = HedgeDocLogoSize.MEDIUM, logoType }) => {
  switch (logoType) {
    case HedgeDocLogoType.COLOR_VERTICAL:
      return <LogoColorVertical className={'w-auto'} height={`${size}px`} width={'auto'} />
    case HedgeDocLogoType.BW_HORIZONTAL:
      return <LogoBwHorizontal className={'w-auto'} height={`${size}px`} width={'auto'} />
    case HedgeDocLogoType.WB_HORIZONTAL:
      return <LogoWbHorizontal className={'w-auto'} height={`${size}px`} width={'auto'} />
    default:
      return null
  }
}
