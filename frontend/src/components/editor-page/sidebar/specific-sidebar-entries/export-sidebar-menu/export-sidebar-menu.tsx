/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../../utils/cypress-attribute'
import { SidebarButton } from '../../sidebar-button/sidebar-button'
import { SidebarMenu } from '../../sidebar-menu/sidebar-menu'
import type { SpecificSidebarMenuProps } from '../../types'
import { DocumentSidebarMenuSelection } from '../../types'
import { ExportMarkdownSidebarEntry } from './entries/export-markdown-sidebar-entry'
import React, { Fragment, useCallback } from 'react'
import {
  ArrowLeft as IconArrowLeft,
  CloudDownload as IconCloudDownload,
  FileCode as IconFileCode
} from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import { concatCssClasses } from '../../../../../utils/concat-css-classes'
import styles from '../../sidebar-button/sidebar-button.module.scss'
import { ExportGistSidebarEntry } from './entries/export-gist-sidebar-entry/export-gist-sidebar-entry'
import { ExportGitlabSnippetSidebarEntry } from './entries/export-gitlab-snippet-sidebar-entry/export-gitlab-snippet-sidebar-entry'
import { ExportPrintSidebarEntry } from './entries/export-print-sidebar-entry'

/**
 * Renders the export menu for the sidebar.
 *
 * @param className Additional class names given to the menu button
 * @param menuId The id of the menu
 * @param onClick The callback, that should be called when the menu button is pressed
 * @param selectedMenuId The currently selected menu id
 */
export const ExportSidebarMenu: React.FC<SpecificSidebarMenuProps> = ({
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
        icon={expand ? IconArrowLeft : IconCloudDownload}
        className={concatCssClasses(className, { [styles.main]: expand })}
        onClick={onClickHandler}>
        <Trans i18nKey={'editor.documentBar.export'} />
      </SidebarButton>
      <SidebarMenu expand={expand}>
        <ExportPrintSidebarEntry />
        <ExportMarkdownSidebarEntry />
        <SidebarButton icon={IconFileCode} disabled={true}>
          HTML
        </SidebarButton>

        <ExportGistSidebarEntry />
        <ExportGitlabSnippetSidebarEntry />

        <SidebarButton icon={IconFileCode} disabled={true}>
          <Trans i18nKey='editor.export.rawHtml' />
        </SidebarButton>
      </SidebarMenu>
    </Fragment>
  )
}
