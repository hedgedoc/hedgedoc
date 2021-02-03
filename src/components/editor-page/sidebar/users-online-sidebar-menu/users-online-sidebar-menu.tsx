/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { SidebarButton } from '../sidebar-button'
import { SidebarMenu } from '../sidebar-menu'
import { DocumentSidebarMenuSelection, SpecificSidebarMenuProps } from '../types'
import { ActiveIndicatorStatus } from './active-indicator'
import './online-counter.scss'
import { UserLine } from './user-line'

export const UsersOnlineSidebarMenu: React.FC<SpecificSidebarMenuProps> = ({
  className,
  menuId,
  onClick,
  selectedMenuId
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [counter] = useState(2)
  useTranslation()

  useEffect(() => {
    const value = `${ counter }`
    buttonRef.current?.style.setProperty('--users-online', `"${ value }"`)
  }, [counter])

  const hide = selectedMenuId !== DocumentSidebarMenuSelection.NONE && selectedMenuId !== menuId
  const expand = selectedMenuId === menuId
  const onClickHandler = useCallback(() => {
    onClick(menuId)
  }, [menuId, onClick])

  return (
    <Fragment>
      <SidebarButton hide={ hide } buttonRef={ buttonRef } onClick={ onClickHandler }
                     icon={ expand ? 'arrow-left' : 'users' }
                     variant={ 'primary' } className={ `online-entry ${ className ?? '' }` }>
        <Trans i18nKey={ 'editor.onlineStatus.online' }/>
      </SidebarButton>
      <SidebarMenu expand={ expand }>
        <SidebarButton>
          <UserLine name="Philip Molares" photo="/img/avatar.png" color="red"
                    status={ ActiveIndicatorStatus.INACTIVE }/>
        </SidebarButton>
        <SidebarButton>
          <UserLine name="Tilman Vatteroth" photo="/img/avatar.png" color="blue"
                    status={ ActiveIndicatorStatus.ACTIVE }/>
        </SidebarButton>
      </SidebarMenu>
    </Fragment>
  )
}
