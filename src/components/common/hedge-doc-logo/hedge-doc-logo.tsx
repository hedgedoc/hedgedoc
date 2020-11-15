import React from 'react'
import { ReactComponent as LogoColor } from './logo_color.svg'

export enum HedgeDocLogoSize {
  SMALL = 32,
  MEDIUM = 64,
  BIG = 256
}

export interface HedgeDocLogoProps {
  size?: HedgeDocLogoSize | number
}

export const HedgeDocLogo: React.FC<HedgeDocLogoProps> = ({ size = HedgeDocLogoSize.MEDIUM }) => {
  return <LogoColor className={'w-auto'} title={'HedgeDoc logo with text'} style={{ height: size }}/>
}
