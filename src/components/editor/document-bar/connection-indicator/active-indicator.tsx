import React from 'react'
import './active-indicator.scss'

export enum ActiveIndicatorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface ActiveIndicatorProps {
  status: ActiveIndicatorStatus;
}

export const ActiveIndicator: React.FC<ActiveIndicatorProps> = ({ status }) => {
  return (
    <span className={`activeIndicator ${status}`}/>
  )
}
