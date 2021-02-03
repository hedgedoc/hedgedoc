/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { IconName } from '../../common/fork-awesome/types'
import { ShowIf } from '../../common/show-if/show-if'
import { SidebarEntryProps } from './types'

export type SidebarEntryVariant = 'primary'

export const SidebarButton: React.FC<SidebarEntryProps> = ({ children, icon, className, variant, buttonRef, hide, ...props }) => {
  return (
    <button ref={ buttonRef }
            className={ `sidebar-entry ${ hide ? 'hide' : '' } ${ variant ? `sidebar-entry-${ variant }` : '' } ${ className ?? '' }` } { ...props } >
      <ShowIf condition={ !!icon }>
        <span className={ 'sidebar-icon' }>
          <ForkAwesomeIcon icon={ icon as IconName }/>
        </span>
      </ShowIf>
      <span className={ 'sidebar-text' }>
        { children }
      </span>
    </button>
  )
}
