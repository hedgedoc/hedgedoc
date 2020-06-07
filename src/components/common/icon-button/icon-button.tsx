import React from 'react'
import { Button, ButtonProps } from 'react-bootstrap'
import { ForkAwesomeIcon, IconName } from '../fork-awesome/fork-awesome-icon'
import './icon-button.scss'

export interface SocialButtonProps extends ButtonProps {
  icon: IconName
  onClick?: () => void
}

export const IconButton: React.FC<SocialButtonProps> = ({ icon, children, variant, onClick }) => {
  return (
    <Button variant={variant} className={'btn-icon p-0 d-inline-flex align-items-stretch'}
      onClick={() => onClick?.()}>
      <span className="icon-part d-flex align-items-center">
        <ForkAwesomeIcon icon={icon} className={'icon'}/>
      </span>
      <span className="text-part d-flex align-items-center">
        {children}
      </span>
    </Button>
  )
}
