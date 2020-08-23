import React from 'react'
import { Link } from 'react-router-dom'
import { ForkAwesomeIcon } from '../fork-awesome/fork-awesome-icon'
import { IconName } from '../fork-awesome/types'
import { ShowIf } from '../show-if/show-if'
import { LinkWithTextProps } from './types'

export const InternalLink: React.FC<LinkWithTextProps> = ({ href, text, icon, id, className = 'text-light' }) => {
  return (
    <Link to={href}
      className={className}
      id={id}
    >
      <ShowIf condition={!!icon}>
        <ForkAwesomeIcon icon={icon as IconName} fixedWidth={true}/>&nbsp;
      </ShowIf>
      {text}
    </Link>
  )
}
