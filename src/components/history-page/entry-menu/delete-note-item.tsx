/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import { DropdownItemWithDeletionModal } from './dropdown-item-with-deletion-modal'

export interface DeleteNoteItemProps {
  onConfirm: () => void
  noteTitle: string
}

export const DeleteNoteItem: React.FC<DeleteNoteItemProps> = ({ noteTitle, onConfirm }) => {
  return (
    <DropdownItemWithDeletionModal
      onConfirm={onConfirm}
      itemI18nKey={'landing.history.menu.deleteNote'}
      modalButtonI18nKey={'editor.modal.deleteNote.button'}
      modalIcon={'trash'}
      modalTitleI18nKey={'editor.modal.deleteNote.title'}
      modalQuestionI18nKey={'editor.modal.deleteNote.question'}
      modalWarningI18nKey={'editor.modal.deleteNote.warning'}
      noteTitle={noteTitle} />
  )
}
