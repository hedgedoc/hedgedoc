/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SidebarButton } from '../../../sidebar-button/sidebar-button'
import React, { Fragment, useCallback } from 'react'
import { Github as IconGithub } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import { fetchGist } from './fetch-gist'
import { ImportFromRemoteMenu } from '../import-from-remote-menu'
import { cypressId } from '../../../../../../utils/cypress-attribute'
import { SidebarMenu } from '../../../sidebar-menu/sidebar-menu'
import type { ImportMenuProps } from '../types'
import { ImportMenuSelection } from '../types'

const buildGithubTokenProvisioningUrl = (): string =>
  'https://github.com/settings/personal-access-tokens/new?name=HedgeDoc+snippet+import&description=Access+token+for+importing+HedgeDoc+notes+from+GitHub+Gist&gists=write'

/**
 * Renders the sidebar entry for importing a GitHub Gist.
 */
export const ImportGistSidebarEntry: React.FC<ImportMenuProps> = ({ selectedMenuId, menuId, onClick }) => {
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
        icon={IconGithub}
        className={''}
        onClick={onClickHandler}>
        <Trans i18nKey={'editor.importExport.service.gist.name'} />
      </SidebarButton>
      <SidebarMenu expand={expand}>
        <ImportFromRemoteMenu
          onImportFinished={onClickHandler}
          icon={IconGithub}
          serviceI18nKey={'editor.importExport.service.gist.shortName'}
          urlPlaceholder={'https://gist.github.com/user/gist-id'}
          tokenProvisioningUrlI18nKey={'editor.importExport.service.gist.tokenLink'}
          buildTokenProvisioningUrl={buildGithubTokenProvisioningUrl}
          fetchContent={fetchGist}
        />
      </SidebarMenu>
    </Fragment>
  )
}
