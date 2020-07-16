import React from 'react'
import { ForkAwesomeIcon, IconName } from '../fork-awesome/fork-awesome-icon'
import { ShowIf } from '../show-if/show-if'
import { LinkWithTextProps } from './types'

export const ExternalLink: React.FC<LinkWithTextProps> = ({ href, text, icon, id, className = 'text-light' }) => {
  return (
    <a href={href}
      target="_blank"
      rel="noopener noreferrer"
      id={id}
      className={className}
      dir='auto'
    >
      <ShowIf condition={!!icon}>
        <ForkAwesomeIcon icon={icon as IconName} fixedWidth={true}/>&nbsp;
      </ShowIf>
      {text}
    </a>
  )
}
