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
import { ImportGistSidebarEntry } from './gist/import-gist-sidebar-entry'
import { ImportGitlabSnippetSidebarEntry } from './gitlab-snippet/import-gitlab-snippet-sidebar-entry'
import { ImportMarkdownSidebarEntry } from './import-markdown-sidebar-entry'
import React, { Fragment, useCallback, useState } from 'react'
import { ArrowLeft as IconArrowLeft, CloudUpload as IconCloudUpload } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import styles from '../../sidebar-button/sidebar-button.module.scss'
import { concatCssClasses } from '../../../../../utils/concat-css-classes'
import { ImportMenuSelection } from './types'

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

  const [selectedSubMenu, setSelectedSubMenu] = useState<ImportMenuSelection>(ImportMenuSelection.NONE)

  const toggleValue = useCallback(
    (toggleValue: ImportMenuSelection): void => {
      const newValue = selectedSubMenu === toggleValue ? ImportMenuSelection.NONE : toggleValue
      setSelectedSubMenu(newValue)
    },
    [selectedSubMenu]
  )

  return (
    <Fragment>
      <SidebarButton
        {...cypressId('menu-import')}
        hide={hide}
        icon={expand ? IconArrowLeft : IconCloudUpload}
        className={concatCssClasses(className, { [styles.main]: expand })}
        onClick={
          selectedSubMenu === ImportMenuSelection.NONE ? onClickHandler : () => toggleValue(ImportMenuSelection.NONE)
        }>
        <Trans i18nKey={'editor.importExport.import.button'} />
        {selectedSubMenu !== ImportMenuSelection.NONE && (
          <Fragment>
            <span className={'mx-1 d-block'}>/</span>
            <Trans i18nKey={`editor.importExport.service.${selectedSubMenu}.name`} />
          </Fragment>
        )}
      </SidebarButton>
      <SidebarMenu expand={expand}>
        <ImportGistSidebarEntry
          selectedMenuId={selectedSubMenu}
          menuId={ImportMenuSelection.GIST}
          onClick={toggleValue}
        />
        <ImportGitlabSnippetSidebarEntry
          selectedMenuId={selectedSubMenu}
          menuId={ImportMenuSelection.SNIPPET}
          onClick={toggleValue}
        />
        <ImportMarkdownSidebarEntry selectedMenuId={selectedSubMenu} />
      </SidebarMenu>
    </Fragment>
  )
}
