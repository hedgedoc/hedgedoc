/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../../../hooks/common/use-boolean-state'
import { IconGitlab } from '../../../../common/icons/additional/icon-gitlab'
import { SidebarButton } from '../../sidebar-button/sidebar-button'
import React, { Fragment } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { fetchGitlabSnippet } from './fetch-gitlab-snippet'
import { ImportCodeSnippetModal } from './import-code-snippet-modal'

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
export const ImportGitlabSnippetSidebarEntry: React.FC = () => {
  useTranslation()
  const [showModal, setShowModal, setHideModal] = useBooleanState(false)

  return (
    <Fragment>
      <SidebarButton icon={IconGitlab} onClick={setShowModal}>
        <Trans i18nKey={'editor.importExport.service.gitlab.name'} />
      </SidebarButton>
      <ImportCodeSnippetModal
        show={showModal}
        onHide={setHideModal}
        icon={IconGitlab}
        serviceI18nKey={'editor.importExport.service.gitlab.shortName'}
        urlPlaceholder={'https://gitlab.com/-/snippets/123'}
        tokenProvisioningUrlI18nKey={'editor.importExport.service.gitlab.tokenLink'}
        buildTokenProvisioningUrl={buildGitlabTokenProvisioningUrl}
        fetchContent={fetchGitlabSnippet}
      />
    </Fragment>
  )
}
