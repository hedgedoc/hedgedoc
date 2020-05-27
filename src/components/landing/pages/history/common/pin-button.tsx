import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import './pin-button.scss'
import { Button } from 'react-bootstrap'

export interface PinButtonProps {
  isPinned: boolean;
  onPinClick: () => void;
  isDark: boolean;
}

export const PinButton: React.FC<PinButtonProps> = ({ isPinned, onPinClick, isDark }) => {
  return (
    <Button variant={isDark ? 'secondary' : 'light'}
      onClick={onPinClick}>
      <FontAwesomeIcon
        icon="thumbtack"
        className={`history-pin ${isPinned ? 'active' : ''}`}
      />
    </Button>
  )
}
