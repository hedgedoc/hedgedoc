/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ExportMarkdownSidebarEntry } from './export-markdown-sidebar-entry'
import { SidebarButton } from '../sidebar-button/sidebar-button'
import { SidebarMenu } from '../sidebar-menu/sidebar-menu'
import type { SpecificSidebarMenuProps } from '../types'
import { DocumentSidebarMenuSelection } from '../types'
import { cypressId } from '../../../../utils/cypress-attribute'

/**
 * Renders the export menu for the sidebar.
 *
 * @param className Additional class names given to the menu button
 * @param menuId The id of the menu
 * @param onClick The callback, that should be called when the menu button is pressed
 * @param selectedMenuId The currently selected menu id
 */
export const ExportMenuSidebarMenu: React.FC<SpecificSidebarMenuProps> = ({
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
        {...cypressId('menu-export')}
        hide={hide}
        icon={expand ? 'arrow-left' : 'cloud-download'}
        className={className}
        onClick={onClickHandler}>
        <Trans i18nKey={'editor.documentBar.export'} />
      </SidebarButton>
      <SidebarMenu expand={expand}>
        <SidebarButton icon={'github'}>Gist</SidebarButton>
        <SidebarButton icon={'gitlab'}>Gitlab Snippet</SidebarButton>

        <ExportMarkdownSidebarEntry />

        <SidebarButton icon={'file-code-o'}>HTML</SidebarButton>
        <SidebarButton icon={'file-code-o'}>
          <Trans i18nKey='editor.export.rawHtml' />
        </SidebarButton>
      </SidebarMenu>
    </Fragment>
  )
}
