import React from 'react'
import { Button } from 'react-bootstrap'
import { ForkAwesomeIcon } from '../../../../common/fork-awesome/fork-awesome-icon'
import { HistoryEntryOrigin } from '../history'
import './sync-status.scss'

export interface SyncStatusProps {
  isDark: boolean
  location: HistoryEntryOrigin
  onSync: () => void
  className?: string
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ isDark, location, onSync, className }) => {
  const icon = location === HistoryEntryOrigin.REMOTE ? 'cloud' : 'laptop'
  return (
    <Button variant={isDark ? 'secondary' : 'light'} onClick={onSync} className={`sync-icon ${className || ''}`}>
      <ForkAwesomeIcon icon={icon}/>
    </Button>
  )
}
