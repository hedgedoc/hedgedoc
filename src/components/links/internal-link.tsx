import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ForkAwesomeIcon } from '../../fork-awesome/fork-awesome-icon'
import { LinkWithTextProps } from './types'

export const InternalLink: React.FC<LinkWithTextProps> = ({ href, text, icon, className = 'text-light' }) => {
  return (
    <Link to={href}
      className={className}>
      <Fragment>
        {
          icon
            ? <Fragment>
              <ForkAwesomeIcon icon={icon} fixedWidth={true}/>&nbsp;
            </Fragment>
            : null
        }
        {text}
      </Fragment>
    </Link>
  )
}
