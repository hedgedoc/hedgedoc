/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useNoteTitle } from '../../../../../hooks/common/use-note-title'
import { cypressId } from '../../../../../utils/cypress-attribute'
import type { ModalVisibilityProps } from '../../../../common/modals/common-modal'
import { DeletionModal } from '../../../../common/modals/deletion-modal'
import React, { useCallback, useMemo, useState } from 'react'
import { Trans } from 'react-i18next'
import { useIsOwner } from '../../../../../hooks/common/use-is-owner'

export interface DeleteNoteModalProps extends ModalVisibilityProps {
  optionalNoteTitle?: string
  onConfirm: (keepMedia: boolean) => void
  overrideIsOwner?: boolean
}

/**
 * A modal that asks the user if they really want to delete the current note.
 *
 * @param optionalNoteTitle optional note title
 * @param show Defines if the modal should be shown
 * @param onHide A callback that fires if the modal should be hidden without confirmation
 * @param onConfirm A callback that fires if the user confirmed the request
 * @param modalTitleI18nKey optional i18nKey for the title
 */
export const DeleteNoteModal: React.FC<DeleteNoteModalProps> = ({
  optionalNoteTitle,
  show,
  onHide,
  onConfirm,
  overrideIsOwner
}) => {
  const [keepMedia, setKeepMedia] = useState(false)
  const noteTitle = useNoteTitle()
  const isOwnerOfCurrentEditedNote = useIsOwner()

  const deletionButtonI18nKey = useMemo(() => {
    return keepMedia ? 'editor.modal.deleteNote.deleteButtonKeepMedia' : 'editor.modal.deleteNote.deleteButton'
  }, [keepMedia])

  const handleConfirm = useCallback(() => {
    onConfirm(keepMedia)
  }, [onConfirm, keepMedia])

  const isOwner = overrideIsOwner ?? isOwnerOfCurrentEditedNote

  return (
    <DeletionModal
      {...cypressId('sidebar.deleteNote.modal')}
      onConfirm={handleConfirm}
      deletionButtonI18nKey={deletionButtonI18nKey}
      show={show}
      onHide={onHide}
      disabled={!isOwner}
      titleI18nKey={'editor.modal.deleteNote.title'}
      footerContent={
        <label className={'me-auto'}>
          <input type='checkbox' checked={keepMedia} onChange={() => setKeepMedia(!keepMedia)} />
          <span className={'ms-1'}>
            <Trans i18nKey={'editor.modal.deleteNote.keepMedia'} />
          </span>
        </label>
      }>
      <h5>
        <Trans i18nKey={'editor.modal.deleteNote.question'} />
      </h5>
      <ul>
        <li {...cypressId('sidebar.deleteNote.modal.noteTitle')}>{optionalNoteTitle ?? noteTitle}</li>
      </ul>
      <h6>
        <Trans i18nKey={'editor.modal.deleteNote.warning'} />
      </h6>
    </DeletionModal>
  )
}
