import React, { Fragment } from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { ForkAwesomeIcon } from '../../fork-awesome/fork-awesome-icon'
import { LinkWithTextProps } from './types'

export const InternalLink: React.FC<LinkWithTextProps> = ({ href, text, icon, className = 'text-light' }) => {
  return (
    <LinkContainer to={href}
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
    </LinkContainer>
  )
}
