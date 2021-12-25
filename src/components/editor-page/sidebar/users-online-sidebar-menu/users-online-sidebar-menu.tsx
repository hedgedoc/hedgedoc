/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { SidebarButton } from '../sidebar-button/sidebar-button'
import { SidebarMenu } from '../sidebar-menu/sidebar-menu'
import type { SpecificSidebarMenuProps } from '../types'
import { DocumentSidebarMenuSelection } from '../types'
import { ActiveIndicatorStatus } from './active-indicator'
import styles from './online-counter.module.scss'
import { UserLine } from '../user-line/user-line'
import { useCustomizeAssetsUrl } from '../../../../hooks/common/use-customize-assets-url'

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
    const value = `${counter}`
    buttonRef.current?.style.setProperty('--users-online', `"${value}"`)
  }, [counter])

  const hide = selectedMenuId !== DocumentSidebarMenuSelection.NONE && selectedMenuId !== menuId
  const expand = selectedMenuId === menuId
  const onClickHandler = useCallback(() => {
    onClick(menuId)
  }, [menuId, onClick])

  const avatarUrl = useCustomizeAssetsUrl() + 'img/avatar.png'

  return (
    <Fragment>
      <SidebarButton
        hide={hide}
        buttonRef={buttonRef}
        onClick={onClickHandler}
        icon={expand ? 'arrow-left' : 'users'}
        className={`${styles['online-entry']} ${className ?? ''}`}
        variant={'primary'}>
        <Trans i18nKey={'editor.onlineStatus.online'} />
      </SidebarButton>
      <SidebarMenu expand={expand}>
        <SidebarButton>
          <UserLine name='Philip Molares' photo={avatarUrl} color='red' status={ActiveIndicatorStatus.INACTIVE} />
        </SidebarButton>
        <SidebarButton>
          <UserLine name='Tilman Vatteroth' photo={avatarUrl} color='blue' status={ActiveIndicatorStatus.ACTIVE} />
        </SidebarButton>
      </SidebarMenu>
    </Fragment>
  )
}
