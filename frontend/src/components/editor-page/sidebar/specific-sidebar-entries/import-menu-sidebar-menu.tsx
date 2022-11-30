/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../utils/cypress-attribute'
import { SidebarButton } from '../sidebar-button/sidebar-button'
import { SidebarMenu } from '../sidebar-menu/sidebar-menu'
import type { SpecificSidebarMenuProps } from '../types'
import { DocumentSidebarMenuSelection } from '../types'
import { ImportMarkdownSidebarEntry } from './import-markdown-sidebar-entry'
import React, { Fragment, useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders the import menu for the sidebar.
 *
 * @param className Additional class names given to the menu button
 * @param menuId The id of the menu
 * @param onClick The callback, that should be called when the menu button is pressed
 * @param selectedMenuId The currently selected menu id
 */
export const ImportMenuSidebarMenu: React.FC<SpecificSidebarMenuProps> = ({
  className,
  menuId,
  onClick,
  selectedMenuId
}) => {
  useTranslation()

  const hide = selectedMenuId !== DocumentSidebarMenuSelection.NONE && selectedMenuId !== menuId
  const expand = selectedMenuId === menuId
  const onClickHandler = useCallback(() => {
    onClick(menuId)
  }, [menuId, onClick])

  return (
    <Fragment>
      <SidebarButton
        {...cypressId('menu-import')}
        hide={hide}
        icon={expand ? 'arrow-left' : 'cloud-upload'}
        className={className}
        onClick={onClickHandler}>
        <Trans i18nKey={'editor.documentBar.import'} />
      </SidebarButton>
      <SidebarMenu expand={expand}>
        <SidebarButton icon={'github'}>Gist</SidebarButton>
        <SidebarButton icon={'gitlab'}>Gitlab Snippet</SidebarButton>
        <SidebarButton icon={'clipboard'}>
          <Trans i18nKey={'editor.import.clipboard'} />
        </SidebarButton>
        <ImportMarkdownSidebarEntry />
      </SidebarMenu>
    </Fragment>
  )
}
