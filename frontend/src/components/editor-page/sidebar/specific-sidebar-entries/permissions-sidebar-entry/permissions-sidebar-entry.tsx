/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SidebarButton } from '../../sidebar-button/sidebar-button'
import { DocumentSidebarMenuSelection, type SpecificSidebarMenuProps } from '../../types'
import React, { Fragment, useCallback } from 'react'
import { Lock as IconLock } from 'react-bootstrap-icons'
import { Trans } from 'react-i18next'
import { cypressId } from '../../../../../utils/cypress-attribute'
import { SidebarMenu } from '../../sidebar-menu/sidebar-menu'
import { PermissionSectionOwner } from './permission-section-owner'
import { PermissionSectionUsers } from './permission-section-users'
import { PermissionSectionSpecialGroups } from './permission-section-special-groups'
import { PermissionSectionVisibility } from './permission-section-visibility'
import { useIsOwner } from '../../../../../hooks/common/use-is-owner'

/**
 * Renders a button to open the permission modal for the sidebar.
 *
 * @param className Additional classes directly given to the button
 * @param hide If the button should be hidden
 */
export const PermissionsSidebarEntry: React.FC<SpecificSidebarMenuProps> = ({
  className,
  menuId,
  onClick,
  selectedMenuId
}) => {
  const isOwner = useIsOwner()
  const hide = selectedMenuId !== DocumentSidebarMenuSelection.NONE && selectedMenuId !== menuId
  const expand = selectedMenuId === menuId
  const onClickHandler = useCallback(() => {
    onClick(menuId)
  }, [menuId, onClick])

  return (
    <Fragment>
      <SidebarButton
        hide={hide}
        className={className}
        icon={IconLock}
        onClick={onClickHandler}
        {...cypressId('sidebar-permission-btn')}>
        <Trans i18nKey={'editor.permissions.title'} />
      </SidebarButton>
      <SidebarMenu expand={expand}>
        <PermissionSectionOwner disabled={!isOwner} />
        <PermissionSectionUsers disabled={!isOwner} />
        <PermissionSectionSpecialGroups disabled={!isOwner} />
        <PermissionSectionVisibility disabled={!isOwner} />
      </SidebarMenu>
    </Fragment>
  )
}
