/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../../../hooks/common/use-boolean-state'
import { cypressId } from '../../../../../utils/cypress-attribute'
import { SidebarButton } from '../../sidebar-button/sidebar-button'
import type { SpecificSidebarEntryProps } from '../../types'
import { NoteInfoModal } from './note-info-modal/note-info-modal'
import React, { Fragment } from 'react'
import { GraphUp as IconGraphUp } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Sidebar entry that allows to open the {@link NoteInfoModal} containing information about the current note.
 *
 * @param className CSS classes to add to the sidebar button
 * @param hide true when the sidebar button should be hidden, false otherwise
 */
export const NoteInfoSidebarEntry: React.FC<SpecificSidebarEntryProps> = ({ className, hide }) => {
  const [modalVisibility, showModal, closeModal] = useBooleanState()
  useTranslation()

  return (
    <Fragment>
      <SidebarButton
        hide={hide}
        className={className}
        icon={IconGraphUp}
        onClick={showModal}
        {...cypressId('sidebar-btn-document-info')}>
        <Trans i18nKey={'editor.modal.documentInfo.title'} />
      </SidebarButton>
      <NoteInfoModal show={modalVisibility} onHide={closeModal} />
    </Fragment>
  )
}
