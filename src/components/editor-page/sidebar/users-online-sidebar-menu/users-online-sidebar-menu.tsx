/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useEffect, useMemo, useRef } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { SidebarButton } from '../sidebar-button/sidebar-button'
import { SidebarMenu } from '../sidebar-menu/sidebar-menu'
import type { SpecificSidebarMenuProps } from '../types'
import { DocumentSidebarMenuSelection } from '../types'
import styles from './online-counter.module.scss'
import { UserLine } from '../user-line/user-line'
import { useApplicationState } from '../../../../hooks/common/use-application-state'

/**
 * Sidebar menu that contains the list of currently online users in the current note session.
 * When the menu is collapsed, the amount of currently online users is shown, otherwise the full list.
 *
 * @param className CSS classes to add to the sidebar menu
 * @param menuId The id of this sidebar menu
 * @param onClick Callback that is fired when the menu is clicked
 * @param selectedMenuId The currently opened sidebar menu
 */
export const UsersOnlineSidebarMenu: React.FC<SpecificSidebarMenuProps> = ({
  className,
  menuId,
  onClick,
  selectedMenuId
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const onlineUsers = useApplicationState((state) => state.realtime.users)
  useTranslation()

  useEffect(() => {
    const value = `${Object.keys(onlineUsers).length}`
    buttonRef.current?.style.setProperty('--users-online', `"${value}"`)
  }, [onlineUsers])

  const hide = selectedMenuId !== DocumentSidebarMenuSelection.NONE && selectedMenuId !== menuId
  const expand = selectedMenuId === menuId
  const onClickHandler = useCallback(() => onClick(menuId), [menuId, onClick])

  const onlineUserElements = useMemo(() => {
    const entries = Object.entries(onlineUsers)
    if (entries.length === 0) {
      return (
        <SidebarButton>
          <span className={'ms-3'}>
            <Trans i18nKey={'editor.onlineStatus.noUsers'}></Trans>
          </span>
        </SidebarButton>
      )
    } else {
      return entries.map(([clientId, onlineUser]) => {
        return (
          <SidebarButton key={clientId}>
            <UserLine username={onlineUser.username} color={onlineUser.color} status={onlineUser.active} />
          </SidebarButton>
        )
      })
    }
  }, [onlineUsers])

  return (
    <Fragment>
      <SidebarButton
        hide={hide}
        buttonRef={buttonRef}
        onClick={onClickHandler}
        icon={expand ? 'arrow-left' : 'users'}
        className={`${styles['online-entry']} ${className ?? ''}`}>
        <Trans i18nKey={'editor.onlineStatus.online'} />
      </SidebarButton>
      <SidebarMenu expand={expand}>{onlineUserElements}</SidebarMenu>
    </Fragment>
  )
}
