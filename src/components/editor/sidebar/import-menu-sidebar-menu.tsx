/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ImportMarkdownSidebarEntry } from './import-markdown-sidebar-entry'
import { SidebarButton } from './sidebar-button'
import { SidebarMenu } from './sidebar-menu'
import { DocumentSidebarMenuSelection, SpecificSidebarMenuProps } from './types'

export const ImportMenuSidebarMenu: React.FC<SpecificSidebarMenuProps> = (
  {
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
      <SidebarButton data-cy={"menu-import"} hide={hide} icon={expand ? "arrow-left" : "cloud-upload"}
                     className={className} onClick={onClickHandler}>
        <Trans i18nKey={'editor.documentBar.import'}/>
      </SidebarButton>
      <SidebarMenu expand={expand}>
        <SidebarButton icon={"github"}>
          Gist
        </SidebarButton>
        <SidebarButton icon={"gitlab"}>
          Gitlab Snippet
        </SidebarButton>
        <SidebarButton icon={"clipboard"}>
          <Trans i18nKey={'editor.import.clipboard'}/>
        </SidebarButton>
        <ImportMarkdownSidebarEntry/>
      </SidebarMenu>
    </Fragment>
  )
}
