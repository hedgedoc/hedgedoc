import React, { Fragment } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { LinkContainer } from 'react-router-bootstrap'
import { IconProp } from '../../utils/iconProp'

export interface InternalLinkProp {
  path: string;
  icon?: IconProp;
  className?: string
}

export interface InternalLinkTextProp {
  text: string;
}

export const InternalLink: React.FC<InternalLinkProp & InternalLinkTextProp> = ({ path, text, icon, className = 'text-light' }) => {
  return (
    <LinkContainer to={path}
      className={className}>
      {
        icon
          ? <Fragment>
            <FontAwesomeIcon icon={icon} fixedWidth={true}/>&nbsp;
          </Fragment>
          : null
      }
      {text}
    </LinkContainer>
  )
}
