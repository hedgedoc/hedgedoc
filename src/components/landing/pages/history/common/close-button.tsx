import React from 'react'
import { Button } from 'react-bootstrap'
import './close-button.scss'
import { ForkAwesomeIcon } from '../../../../../fork-awesome/fork-awesome-icon'

export interface CloseButtonProps {
  isDark: boolean;
}

const CloseButton: React.FC<CloseButtonProps> = ({ isDark }) => {
  return (
    <Button variant={isDark ? 'secondary' : 'light'}>
      <ForkAwesomeIcon
        className="history-close"
        icon="times"
      />
    </Button>
  )
}

export { CloseButton }
