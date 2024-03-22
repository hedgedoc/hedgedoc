/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment } from 'react'
import { Github as IconGithub } from 'react-bootstrap-icons'
import { SidebarButton } from '../../../../sidebar-button/sidebar-button'
import { ExportGistModal } from './export-gist-modal'
import { useBooleanState } from '../../../../../../../hooks/common/use-boolean-state'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders the sidebar entry for exporting the note content to a GitHub Gist.
 */
export const ExportGistSidebarEntry: React.FC = () => {
  useTranslation()
  const [showModal, setShowModal, setHideModal] = useBooleanState(false)

  return (
    <Fragment>
      <SidebarButton icon={IconGithub} onClick={setShowModal}>
        <Trans i18nKey={'editor.export.gist.service'} />
      </SidebarButton>
      <ExportGistModal show={showModal} onHide={setHideModal} />
    </Fragment>
  )
}
