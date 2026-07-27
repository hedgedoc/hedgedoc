/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../../../../hooks/common/use-boolean-state'
import { SidebarButton } from '../../../sidebar-button/sidebar-button'
import React, { Fragment } from 'react'
import { Github as IconGithub } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import { fetchGist } from './fetch-gist'
import { ImportFromRemoteModal } from '../import-from-remote-modal'

const buildGithubTokenProvisioningUrl = (): string =>
  'https://github.com/settings/personal-access-tokens/new?name=HedgeDoc+snippet+import&description=Access+token+for+importing+HedgeDoc+notes+from+GitHub+Gist&gists=write'

/**
 * Renders the sidebar entry for importing a GitHub Gist.
 */
export const ImportGistSidebarEntry: React.FC = () => {
  useTranslation()
  const [showModal, setShowModal, setHideModal] = useBooleanState(false)

  return (
    <Fragment>
      <SidebarButton icon={IconGithub} onClick={setShowModal}>
        <Trans i18nKey={'editor.importExport.service.gist.name'} />
      </SidebarButton>
      <ImportFromRemoteModal
        show={showModal}
        onHide={setHideModal}
        icon={IconGithub}
        serviceI18nKey={'editor.importExport.service.gist.shortName'}
        urlPlaceholder={'https://gist.github.com/user/gist-id'}
        tokenProvisioningUrlI18nKey={'editor.importExport.service.gist.tokenLink'}
        buildTokenProvisioningUrl={buildGithubTokenProvisioningUrl}
        fetchContent={fetchGist}
      />
    </Fragment>
  )
}
