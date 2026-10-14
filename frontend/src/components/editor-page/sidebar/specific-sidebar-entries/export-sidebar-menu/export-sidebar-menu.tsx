/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../../utils/cypress-attribute'
import { SidebarButton } from '../../sidebar-button/sidebar-button'
import { SidebarMenu } from '../../sidebar-menu/sidebar-menu'
import type { SpecificSidebarMenuProps } from '../../types'
import { DocumentSidebarMenuSelection } from '../../types'
import { ExportMarkdownSidebarEntry } from './entries/export-markdown-sidebar-entry'
import React, { Fragment, useCallback, useState } from 'react'
import { ArrowLeft as IconArrowLeft, CloudDownload as IconCloudDownload } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import { concatCssClasses } from '../../../../../utils/concat-css-classes'
import styles from '../../sidebar-button/sidebar-button.module.scss'
import { ExportGistSidebarEntry } from './entries/export-gist-sidebar-entry/export-gist-sidebar-entry'
import { ExportGitlabSnippetSidebarEntry } from './entries/export-gitlab-snippet-sidebar-entry/export-gitlab-snippet-sidebar-entry'
import { ExportPrintSidebarEntry } from './entries/export-print-sidebar-entry'
import { ExportHtmlSidebarEntries } from './entries/export-html-sidebar-entries/export-html-sidebar-entries'
import { ExportMenuSelection } from './types'

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

  const [selectedSubMenu, setSelectedSubMenu] = useState<ExportMenuSelection>(ExportMenuSelection.NONE)

  const toggleValue = useCallback(
    (toggleValue: ExportMenuSelection): void => {
      const newValue = selectedSubMenu === toggleValue ? ExportMenuSelection.NONE : toggleValue
      setSelectedSubMenu(newValue)
    },
    [selectedSubMenu]
  )

  return (
    <Fragment>
      <SidebarButton
        {...cypressId('menu-export')}
        hide={hide}
        icon={expand ? IconArrowLeft : IconCloudDownload}
        className={concatCssClasses(className, { [styles.main]: expand })}
        onClick={
          selectedSubMenu === ExportMenuSelection.NONE ? onClickHandler : () => toggleValue(ExportMenuSelection.NONE)
        }>
        <Trans i18nKey={'editor.importExport.export.button'} />
        {selectedSubMenu !== ExportMenuSelection.NONE && (
          <Fragment>
            <span className={'mx-1 d-block'}>/</span>
            <Trans i18nKey={`editor.importExport.service.${selectedSubMenu}.name`} />
          </Fragment>
        )}
      </SidebarButton>
      <SidebarMenu expand={expand}>
        <ExportPrintSidebarEntry selectedMenuId={selectedSubMenu} />
        <ExportMarkdownSidebarEntry selectedMenuId={selectedSubMenu} />
        <ExportHtmlSidebarEntries selectedMenuId={selectedSubMenu} />
        <ExportGistSidebarEntry
          menuId={ExportMenuSelection.GIST}
          selectedMenuId={selectedSubMenu}
          onClick={toggleValue}
        />
        <ExportGitlabSnippetSidebarEntry
          menuId={ExportMenuSelection.SNIPPET}
          selectedMenuId={selectedSubMenu}
          onClick={toggleValue}
        />
      </SidebarMenu>
    </Fragment>
  )
}
