import React from 'react'
import './pin-button.scss'
import { Button } from 'react-bootstrap'
import { ForkAwesomeIcon } from '../../../../../fork-awesome/fork-awesome-icon'

export interface PinButtonProps {
  isPinned: boolean;
  onPinClick: () => void;
  isDark: boolean;
}

export const PinButton: React.FC<PinButtonProps> = ({ isPinned, onPinClick, isDark }) => {
  return (
    <Button variant={isDark ? 'secondary' : 'light'}
      onClick={onPinClick}>
      <ForkAwesomeIcon
        icon="thumb-tack"
        className={`history-pin ${isPinned ? 'active' : ''}`}
      />
    </Button>
  )
}
