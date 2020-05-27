import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './social-link-button.scss'
import { IconProp } from '../../../../../../utils/iconProp'

export interface SocialButtonProps {
  backgroundClass: string,
  href: string
  icon: IconProp
  title?: string
}

export const SocialLinkButton: React.FC<SocialButtonProps> = ({ title, backgroundClass, href, icon, children }) => {
  return (
    <a href={href} title={title}
      className={'btn social-link-button p-0 d-inline-flex align-items-stretch ' + backgroundClass}>
      <span className="icon-part d-flex align-items-center">
        <FontAwesomeIcon icon={icon} className={'social-icon'} fixedWidth={true}/>
      </span>
      <span className="text-part d-flex align-items-center mx-auto">
        {children}
      </span>
    </a>
  )
}
