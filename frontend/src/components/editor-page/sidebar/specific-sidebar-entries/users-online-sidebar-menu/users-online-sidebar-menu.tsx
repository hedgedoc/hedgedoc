/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { concatCssClasses } from '../../../../../utils/concat-css-classes'
import { SidebarButton } from '../../sidebar-button/sidebar-button'
import { SidebarMenu } from '../../sidebar-menu/sidebar-menu'
import type { SpecificSidebarMenuProps } from '../../types'
import { DocumentSidebarMenuSelection } from '../../types'
import styles from './online-counter.module.scss'
import { OwnUserLine } from './own-user-line'
import { UserLine } from './user-line/user-line'
import React, { Fragment, useCallback, useEffect, useMemo, useRef } from 'react'
import { ArrowLeft as IconArrowLeft, People as IconPeople } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import buttonStyles from '../../sidebar-button/sidebar-button.module.scss'

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
  const realtimeUsers = useApplicationState((state) => state.realtimeStatus.onlineUsers)
  useTranslation()

  useEffect(() => {
    buttonRef.current?.style.setProperty('--users-online', `"${realtimeUsers.length + 1}"`)
  }, [realtimeUsers])

  const hide = selectedMenuId !== DocumentSidebarMenuSelection.NONE && selectedMenuId !== menuId
  const expand = selectedMenuId === menuId
  const onClickHandler = useCallback(() => onClick(menuId), [menuId, onClick])

  const onlineUserElements = useMemo(() => {
    if (realtimeUsers.length === 0) {
      return null
    } else {
      return realtimeUsers.map((realtimeUser, index) => {
        return (
          <SidebarButton key={index}>
            <UserLine
              displayName={realtimeUser.displayName}
              username={realtimeUser.username}
              color={realtimeUser.styleIndex}
              active={realtimeUser.active}
            />
          </SidebarButton>
        )
      })
    }
  }, [realtimeUsers])

  return (
    <Fragment>
      <SidebarButton
        hide={hide}
        buttonRef={buttonRef}
        onClick={onClickHandler}
        icon={expand ? IconArrowLeft : IconPeople}
        className={concatCssClasses(styles.entry, buttonStyles.main, className)}>
        <Trans i18nKey={'editor.onlineStatus.online'} />
      </SidebarButton>
      <SidebarMenu expand={expand}>
        <OwnUserLine />
        {onlineUserElements}
      </SidebarMenu>
    </Fragment>
  )
}
