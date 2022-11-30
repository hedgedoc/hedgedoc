/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import LogoBwHorizontal from './logo_text_bw_horizontal.svg'
import LogoColorVertical from './logo_text_color_vertical.svg'
import LogoWbHorizontal from './logo_text_wb_horizontal.svg'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const altText = useMemo(() => t('app.icon'), [t])
  const style = useMemo(() => ({ height: size }), [size])

  switch (logoType) {
    case HedgeDocLogoType.COLOR_VERTICAL:
      return <LogoColorVertical className={'w-auto'} title={altText} style={style} />
    case HedgeDocLogoType.BW_HORIZONTAL:
      return <LogoBwHorizontal className={'w-auto'} title={altText} style={style} />
    case HedgeDocLogoType.WB_HORIZONTAL:
      return <LogoWbHorizontal className={'w-auto'} title={altText} style={style} />
    default:
      return null
  }
}
