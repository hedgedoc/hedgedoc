/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../utils/cypress-attribute'
import { IconGitlab } from '../../../common/icons/additional/icon-gitlab'
import { SidebarButton } from '../sidebar-button/sidebar-button'
import { SidebarMenu } from '../sidebar-menu/sidebar-menu'
import type { SpecificSidebarMenuProps } from '../types'
import { DocumentSidebarMenuSelection } from '../types'
import { ExportMarkdownSidebarEntry } from './export-markdown-sidebar-entry'
import React, { Fragment, useCallback } from 'react'
import {
  ArrowLeft as IconArrowLeft,
  CloudDownload as IconCloudDownload,
  FileCode as IconFileCode,
  Github as IconGithub
} from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

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
  //todo: replace git with gitlab icon
  return (
    <Fragment>
      <SidebarButton
        {...cypressId('menu-export')}
        hide={hide}
        icon={expand ? IconArrowLeft : IconCloudDownload}
        className={className}
        onClick={onClickHandler}>
        <Trans i18nKey={'editor.documentBar.export'} />
      </SidebarButton>
      <SidebarMenu expand={expand}>
        <SidebarButton icon={IconGithub} disabled={true}>
          Gist
        </SidebarButton>
        <SidebarButton icon={IconGitlab} disabled={true}>
          Gitlab Snippet
        </SidebarButton>

        <ExportMarkdownSidebarEntry />

        <SidebarButton icon={IconFileCode} disabled={true}>
          HTML
        </SidebarButton>
        <SidebarButton icon={IconFileCode} disabled={true}>
          <Trans i18nKey='editor.export.rawHtml' />
        </SidebarButton>
      </SidebarMenu>
    </Fragment>
  )
}
