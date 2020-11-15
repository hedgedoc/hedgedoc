import React from 'react'
import { ReactComponent as LogoColorVertical } from './logo_text_color_vertical.svg'
import { ReactComponent as LogoBwHorizontal } from './logo_text_bw_horizontal.svg'
import { ReactComponent as LogoWbHorizontal } from './logo_text_wb_horizontal.svg'

export enum HedgeDocLogoSize {
  SMALL = 32,
  MEDIUM = 64,
  BIG= 256
}

export interface HedgeDocLogoProps {
  size?: HedgeDocLogoSize | number,
  logoType: HedgeDocLogoType
}

export enum HedgeDocLogoType {
  COLOR_VERTICAL,
  BW_HORIZONTAL,
  WB_HORIZONTAL
}

export const HedgeDocLogoWithText: React.FC<HedgeDocLogoProps> = ({ size = HedgeDocLogoSize.MEDIUM, logoType }) => {
  switch (logoType) {
    case HedgeDocLogoType.COLOR_VERTICAL:
      return <LogoColorVertical className={'w-auto'} title={'HedgeDoc logo with text'} style={{ height: size }}/>
    case HedgeDocLogoType.BW_HORIZONTAL:
      return <LogoBwHorizontal className={'w-auto'} title={'HedgeDoc logo with text'} style={{ height: size }}/>
    case HedgeDocLogoType.WB_HORIZONTAL:
      return <LogoWbHorizontal className={'w-auto'} title={'HedgeDoc logo with text'} style={{ height: size }}/>
    default:
      return null
  }
}
