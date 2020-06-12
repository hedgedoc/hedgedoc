import React from 'react'
import './split-divider.scss'

export interface SplitDividerProps {
  onGrab: () => void
}

export const SplitDivider: React.FC<SplitDividerProps> = ({ onGrab }) => {
  return (
    <div
      onMouseDown={() => onGrab()}
      onTouchStart={() => onGrab()}
      className={'split-divider'}/>
  )
}
