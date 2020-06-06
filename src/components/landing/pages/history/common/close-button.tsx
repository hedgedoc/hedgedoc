import React from 'react'
import { Button } from 'react-bootstrap'
import { ForkAwesomeIcon } from '../../../../../fork-awesome/fork-awesome-icon'
import './close-button.scss'

export interface CloseButtonProps {
  isDark: boolean;
  className?: string
}

const CloseButton: React.FC<CloseButtonProps> = ({ isDark, className }) => {
  return (
    <Button variant={isDark ? 'secondary' : 'light'} className={`history-close ${className || ''}`}>
      <ForkAwesomeIcon icon="times"/>
    </Button>
  )
}

export { CloseButton }
