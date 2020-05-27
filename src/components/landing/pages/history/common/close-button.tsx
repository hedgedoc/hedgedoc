import React from 'react'
import { Button } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './close-button.scss'

export interface CloseButtonProps {
  isDark: boolean;
}

const CloseButton: React.FC<CloseButtonProps> = ({ isDark }) => {
  return (
    <Button variant={isDark ? 'secondary' : 'light'}>
      <FontAwesomeIcon
        className="history-close"
        icon="times"
      />
    </Button>
  )
}

export { CloseButton }
