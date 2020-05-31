import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { Fragment } from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { LinkWithTextProps } from './types'

export const InternalLink: React.FC<LinkWithTextProps> = ({ href, text, icon, className = 'text-light' }) => {
  return (
    <LinkContainer to={href}
      className={className}>
      <Fragment>
        {
          icon
            ? <Fragment>
              <FontAwesomeIcon icon={icon} fixedWidth={true}/>&nbsp;
            </Fragment>
            : null
        }
        {text}
      </Fragment>
    </LinkContainer>
  )
}
