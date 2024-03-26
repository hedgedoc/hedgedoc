/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment } from 'react'
import { SidebarButton } from '../../../../sidebar-button/sidebar-button'
import { useBooleanState } from '../../../../../../../hooks/common/use-boolean-state'
import { Trans, useTranslation } from 'react-i18next'
import { IconGitlab } from '../../../../../../common/icons/additional/icon-gitlab'
import { ExportGitlabSnippetModal } from './export-gitlab-snippet-modal'

/**
 * Renders the sidebar entry for exporting the note content to a GitLab snippet.
 */
export const ExportGitlabSnippetSidebarEntry: React.FC = () => {
  useTranslation()
  const [showModal, setShowModal, setHideModal] = useBooleanState(false)

  return (
    <Fragment>
      <SidebarButton icon={IconGitlab} onClick={setShowModal}>
        <Trans i18nKey={'editor.export.gitlab.service'} />
      </SidebarButton>
      <ExportGitlabSnippetModal show={showModal} onHide={setHideModal} />
    </Fragment>
  )
}
