/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useNoteTitle } from '../../../../../hooks/common/use-note-title'
import { cypressId } from '../../../../../utils/cypress-attribute'
import type { ModalVisibilityProps } from '../../../../common/modals/common-modal'
import { DeletionModal } from '../../../../common/modals/deletion-modal'
import React from 'react'
import { Trans } from 'react-i18next'
import { useIsOwner } from '../../../../../hooks/common/use-is-owner'

export interface DeleteHistoryNoteModalProps {
  modalTitleI18nKey?: string
  modalQuestionI18nKey?: string
  modalWarningI18nKey?: string
  modalButtonI18nKey?: string
}

export interface DeleteNoteModalProps extends ModalVisibilityProps {
  optionalNoteTitle?: string
  onConfirm: () => void
}

/**
 * A modal that asks the user if they really want to delete the current note.
 *
 * @param optionalNoteTitle optional note title
 * @param show Defines if the modal should be shown
 * @param onHide A callback that fires if the modal should be hidden without confirmation
 * @param onConfirm A callback that fires if the user confirmed the request
 * @param modalTitleI18nKey optional i18nKey for the title
 * @param modalQuestionI18nKey optional i18nKey for the question
 * @param modalWarningI18nKey optional i18nKey for the warning
 * @param modalButtonI18nKey optional i18nKey for the button
 */
export const DeleteNoteModal: React.FC<DeleteNoteModalProps & DeleteHistoryNoteModalProps> = ({
  optionalNoteTitle,
  show,
  onHide,
  onConfirm,
  modalTitleI18nKey,
  modalQuestionI18nKey,
  modalWarningI18nKey,
  modalButtonI18nKey
}) => {
  const noteTitle = useNoteTitle()
  const isOwner = useIsOwner()

  return (
    <DeletionModal
      {...cypressId('sidebar.deleteNote.modal')}
      onConfirm={onConfirm}
      deletionButtonI18nKey={modalButtonI18nKey ?? 'editor.modal.deleteNote.button'}
      show={show}
      onHide={onHide}
      disabled={!isOwner}
      titleI18nKey={modalTitleI18nKey ?? 'editor.modal.deleteNote.title'}>
      <h5>
        <Trans i18nKey={modalQuestionI18nKey ?? 'editor.modal.deleteNote.question'} />
      </h5>
      <ul>
        <li {...cypressId('sidebar.deleteNote.modal.noteTitle')}>{optionalNoteTitle ?? noteTitle}</li>
      </ul>
      <h6>
        <Trans i18nKey={modalWarningI18nKey ?? 'editor.modal.deleteNote.warning'} />
      </h6>
    </DeletionModal>
  )
}
