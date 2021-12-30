/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { cypressId } from '../../../../utils/cypress-attribute'
import { Trans } from 'react-i18next'
import { DeletionModal } from '../../../common/modals/deletion-modal'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import type { ModalVisibilityProps } from '../../../common/modals/common-modal'

export interface DeleteNoteModalProps extends ModalVisibilityProps {
  onConfirm: () => void
}

/**
 * A modal that asks the user if they really want to delete the current note.
 *
 * @param show Defines if the modal should be shown
 * @param onHide A callback that fires if the modal should be hidden without confirmation
 * @param onConfirm A callback that fires if the user confirmed the request
 */
export const DeleteNoteModal: React.FC<DeleteNoteModalProps> = ({ show, onHide, onConfirm }) => {
  const noteTitle = useApplicationState((state) => state.noteDetails.noteTitle)

  return (
    <DeletionModal
      {...cypressId('sidebar.deleteNote.modal')}
      onConfirm={onConfirm}
      deletionButtonI18nKey={'editor.modal.deleteNote.button'}
      show={show}
      onHide={onHide}
      title={'editor.modal.deleteNote.title'}>
      <h5>
        <Trans i18nKey={'editor.modal.deleteNote.question'} />
      </h5>
      <ul>
        <li {...cypressId('sidebar.deleteNote.modal.noteTitle')}>&nbsp;{noteTitle}</li>
      </ul>
      <h6>
        <Trans i18nKey={'editor.modal.deleteNote.warning'} />
      </h6>
    </DeletionModal>
  )
}
