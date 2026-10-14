/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment, useCallback } from 'react'
import { SidebarButton } from '../../../../sidebar-button/sidebar-button'
import { Trans, useTranslation } from 'react-i18next'
import { IconGitlab } from '../../../../../../common/icons/additional/icon-gitlab'
import type { ExportMenuProps } from '../../types'
import { ExportMenuSelection } from '../../types'
import { cypressId } from '../../../../../../../utils/cypress-attribute'
import { SidebarMenu } from '../../../../sidebar-menu/sidebar-menu'
import { ExportGitlabSnippetMenu } from './export-gitlab-snippet-menu'

/**
 * Renders the sidebar entry for exporting the note content to a GitLab snippet.
 */
export const ExportGitlabSnippetSidebarEntry: React.FC<ExportMenuProps> = ({ menuId, selectedMenuId, onClick }) => {
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
        icon={IconGitlab}
        className={''}
        onClick={onClickHandler}>
        <Trans i18nKey={'editor.importExport.service.gitlab.name'} />
      </SidebarButton>
      <SidebarMenu expand={expand}>
        <ExportGitlabSnippetMenu onExportFinished={onClickHandler} />
      </SidebarMenu>
    </Fragment>
  )
}
