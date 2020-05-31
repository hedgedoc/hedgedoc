import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { Fragment } from 'react'
import { LinkWithTextProps } from './types'

export const ExternalLink: React.FC<LinkWithTextProps> = ({ href, text, icon, className = 'text-light' }) => {
  return (
    <a href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}>
      {
        icon
          ? <Fragment>
            <FontAwesomeIcon icon={icon} fixedWidth={true}/>&nbsp;
          </Fragment>
          : null
      }
      {text}
    </a>
  )
}
