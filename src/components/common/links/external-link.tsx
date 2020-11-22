/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import { ForkAwesomeIcon } from '../fork-awesome/fork-awesome-icon'
import { IconName } from '../fork-awesome/types'
import { ShowIf } from '../show-if/show-if'
import { LinkWithTextProps } from './types'

export const ExternalLink: React.FC<LinkWithTextProps> = ({ href, text, icon, id, className = 'text-light', title }) => {
  return (
    <a href={href}
      target="_blank"
      rel="noopener noreferrer"
      id={id}
      className={className}
      title={title}
      dir='auto'
    >
      <ShowIf condition={!!icon}>
        <ForkAwesomeIcon icon={icon as IconName} fixedWidth={true}/>&nbsp;
      </ShowIf>
      {text}
    </a>
  )
}
