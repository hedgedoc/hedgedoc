/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IconGitlab } from '../../../../../common/icons/additional/icon-gitlab'
import { SidebarButton } from '../../../sidebar-button/sidebar-button'
import React, { Fragment, useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { fetchGitlabSnippet } from './fetch-gitlab-snippet'
import { ImportFromRemoteMenu } from '../import-from-remote-menu'
import { cypressId } from '../../../../../../utils/cypress-attribute'
import { SidebarMenu } from '../../../sidebar-menu/sidebar-menu'
import type { ImportMenuProps } from '../types'
import { ImportMenuSelection } from '../types'

const buildGitlabTokenProvisioningUrl = (snippetUrl: string): string => {
  let instanceOrigin = 'https://gitlab.com'
  try {
    const url = new URL(snippetUrl)
    if (['http:', 'https:'].includes(url.protocol)) {
      instanceOrigin = url.origin
    }
  } catch {
    // Use GitLab.com until a valid instance URL has been entered.
  }
  return `${instanceOrigin}/-/user_settings/personal_access_tokens?name=HedgeDoc+snippet+import&scopes=read_api`
}

/**
 * Renders the sidebar entry for importing a GitLab snippet.
 */
export const ImportGitlabSnippetSidebarEntry: React.FC<ImportMenuProps> = ({ selectedMenuId, menuId, onClick }) => {
  useTranslation()
  const hide = selectedMenuId !== ImportMenuSelection.NONE
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
        <ImportFromRemoteMenu
          onImportFinished={onClickHandler}
          icon={IconGitlab}
          serviceI18nKey={'editor.importExport.service.gitlab.shortName'}
          urlPlaceholder={'https://gitlab.com/-/snippets/123'}
          tokenProvisioningUrlI18nKey={'editor.importExport.service.gitlab.tokenLink'}
          buildTokenProvisioningUrl={buildGitlabTokenProvisioningUrl}
          fetchContent={fetchGitlabSnippet}
        />
      </SidebarMenu>
    </Fragment>
  )
}
