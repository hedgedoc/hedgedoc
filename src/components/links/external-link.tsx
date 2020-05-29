import React, { Fragment } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '../../utils/iconProp'

export interface ExternalLinkProp {
  href: string;
  text: string;
  icon?: IconProp;
  className?: string
}

export const ExternalLink: React.FC<ExternalLinkProp> = ({ href, text, icon, className = 'text-light' }) => {
  return (
    <a href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}>
      {
        icon
          ? <Fragment>
            <FontAwesomeIcon icon={icon}/>&nbsp;
          </Fragment>
          : null
      }
      {text}
    </a>
  )
}
