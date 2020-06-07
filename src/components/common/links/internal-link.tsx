import React from 'react'
import { Link } from 'react-router-dom'
import { ForkAwesomeIcon, IconName } from '../fork-awesome/fork-awesome-icon'
import { ShowIf } from '../show-if/show-if'
import { LinkWithTextProps } from './types'

export const InternalLink: React.FC<LinkWithTextProps> = ({ href, text, icon, className = 'text-light' }) => {
  return (
    <Link to={href}
      className={className}>
      <ShowIf condition={!!icon}>
        <ForkAwesomeIcon icon={icon as IconName} fixedWidth={true}/>&nbsp;
      </ShowIf>
      {text}
    </Link>
  )
}
