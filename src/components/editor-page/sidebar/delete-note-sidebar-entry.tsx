/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { DeletionModal } from '../../common/modals/deletion-modal'
import { SidebarButton } from './sidebar-button'
import type { SpecificSidebarEntryProps } from './types'

export const DeleteNoteSidebarEntry: React.FC<SpecificSidebarEntryProps> = ({ hide, className }) => {
  useTranslation()
  const [showDialog, setShowDialog] = useState(false)

  return (
    <Fragment>
      <SidebarButton icon={'trash'} className={className} hide={hide} onClick={() => setShowDialog(true)}>
        <Trans i18nKey={'landing.history.menu.deleteNote'} />
      </SidebarButton>
      <DeletionModal
        onConfirm={() => setShowDialog(false)}
        deletionButtonI18nKey={'editor.modal.deleteNote.button'}
        show={showDialog}
        onHide={() => setShowDialog(false)}
        titleI18nKey={'editor.modal.deleteNote.title'}>
        <h5>
          <Trans i18nKey={'editor.modal.deleteNote.question'} />
        </h5>
        <ul>
          <li> noteTitle</li>
        </ul>
        <h6>
          <Trans i18nKey={'editor.modal.deleteNote.warning'} />
        </h6>
      </DeletionModal>
    </Fragment>
  )
}
