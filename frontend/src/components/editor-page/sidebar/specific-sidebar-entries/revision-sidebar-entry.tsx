/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../../hooks/common/use-boolean-state'
import { RevisionModal } from '../../document-bar/revisions/revision-modal'
import { SidebarButton } from '../sidebar-button/sidebar-button'
import type { SpecificSidebarEntryProps } from '../types'
import React, { Fragment } from 'react'
import { ClockHistory as IconClockHistory } from 'react-bootstrap-icons'
import { Trans } from 'react-i18next'

/**
 * Renders a button to open the revision modal for the sidebar.
 *
 * @param className Additional classes directly given to the button
 * @param hide If the button should be hidden
 */
export const RevisionSidebarEntry: React.FC<SpecificSidebarEntryProps> = ({ className, hide }) => {
  const [modalVisibility, showModal, closeModal] = useBooleanState()

  return (
    <Fragment>
      <SidebarButton hide={hide} className={className} icon={IconClockHistory} onClick={showModal}>
        <Trans i18nKey={'editor.modal.revision.title'} />
      </SidebarButton>
      <RevisionModal show={modalVisibility} onHide={closeModal} />
    </Fragment>
  )
}
