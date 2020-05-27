import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './icon-button.scss'
import { Button, ButtonProps } from 'react-bootstrap'
import { IconProp } from '../../utils/iconProp'

export interface SocialButtonProps extends ButtonProps {
  icon: IconProp
  onClick?: () => void
}

export const IconButton: React.FC<SocialButtonProps> = ({ icon, children, variant, onClick }) => {
  return (
    <Button variant={variant} className={'btn-icon p-0 d-inline-flex align-items-stretch'}
      onClick={() => onClick?.()}>
      <span className="icon-part d-flex align-items-center">
        <FontAwesomeIcon icon={icon} className={'icon'}/>
      </span>
      <span className="text-part d-flex align-items-center">
        {children}
      </span>
    </Button>
  )
}
