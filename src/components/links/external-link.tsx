import React, { Fragment } from 'react'
import { ForkAwesomeIcon } from '../../fork-awesome/fork-awesome-icon'
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
            <ForkAwesomeIcon icon={icon} fixedWidth={true}/>&nbsp;
          </Fragment>
          : null
      }
      {text}
    </a>
  )
}
