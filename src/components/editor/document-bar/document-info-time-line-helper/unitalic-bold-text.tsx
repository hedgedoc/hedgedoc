import React from 'react'
import './unitalic-bold-text.scss'

export interface BoldTextProps {
  text: string ;
}

export const UnitalicBoldText: React.FC<BoldTextProps> = ({ text }) => {
  return <b className={'font-style-normal mr-1'}>{text}</b>
}
