/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import type { IconName } from '../../../common/fork-awesome/types'
import './social-link-button.scss'

export interface SocialButtonProps {
  backgroundClass: string
  href: string
  icon: IconName
  title?: string
}

export const SocialLinkButton: React.FC<SocialButtonProps> = ({ title, backgroundClass, href, icon, children }) => {
  return (
    <a
      href={href}
      title={title}
      className={'btn social-link-button p-0 d-inline-flex align-items-stretch ' + backgroundClass}>
      <span className='icon-part d-flex align-items-center'>
        <ForkAwesomeIcon icon={icon} className={'social-icon'} fixedWidth={true} />
      </span>
      <span className='text-part d-flex align-items-center mx-auto'>{children}</span>
    </a>
  )
}
