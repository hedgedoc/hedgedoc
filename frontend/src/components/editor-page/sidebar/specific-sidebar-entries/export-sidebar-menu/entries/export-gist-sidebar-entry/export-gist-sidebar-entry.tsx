/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment, useCallback } from 'react'
import { Github as IconGithub } from 'react-bootstrap-icons'
import { SidebarButton } from '../../../../sidebar-button/sidebar-button'
import { Trans, useTranslation } from 'react-i18next'
import type { ExportMenuProps } from '../../types'
import { ExportMenuSelection } from '../../types'
import { cypressId } from '../../../../../../../utils/cypress-attribute'
import { SidebarMenu } from '../../../../sidebar-menu/sidebar-menu'
import { ExportGistMenu } from './export-gist-menu'

/**
 * Renders the sidebar entry for exporting the note content to a GitHub Gist.
 */
export const ExportGistSidebarEntry: React.FC<ExportMenuProps> = ({ menuId, selectedMenuId, onClick }) => {
  useTranslation()
  const hide = selectedMenuId !== ExportMenuSelection.NONE
  const expand = selectedMenuId === menuId
  const onClickHandler = useCallback(() => {
    onClick(menuId)
  }, [menuId, onClick])

  return (
    <Fragment>
      <SidebarButton
        {...cypressId('menu-import')}
        hide={hide}
        icon={IconGithub}
        className={''}
        onClick={onClickHandler}>
        <Trans i18nKey={'editor.importExport.service.gist.name'} />
      </SidebarButton>
      <SidebarMenu expand={expand}>
        <ExportGistMenu onExportFinished={onClickHandler} />
      </SidebarMenu>
    </Fragment>
  )
}
