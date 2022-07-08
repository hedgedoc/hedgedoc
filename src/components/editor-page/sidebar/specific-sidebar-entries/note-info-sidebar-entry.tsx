/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { NoteInfoModal } from '../../document-bar/note-info/note-info-modal'
import { SidebarButton } from '../sidebar-button/sidebar-button'
import type { SpecificSidebarEntryProps } from '../types'
import { cypressId } from '../../../../utils/cypress-attribute'
import { useBooleanState } from '../../../../hooks/common/use-boolean-state'

export const NoteInfoSidebarEntry: React.FC<SpecificSidebarEntryProps> = ({ className, hide }) => {
  const [modalVisibility, showModal, closeModal] = useBooleanState()
  useTranslation()

  return (
    <Fragment>
      <SidebarButton
        hide={hide}
        className={className}
        icon={'line-chart'}
        onClick={showModal}
        {...cypressId('sidebar-btn-document-info')}>
        <Trans i18nKey={'editor.modal.documentInfo.title'} />
      </SidebarButton>
      <NoteInfoModal show={modalVisibility} onHide={closeModal} />
    </Fragment>
  )
}
