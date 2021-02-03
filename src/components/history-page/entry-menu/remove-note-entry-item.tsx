/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { DropdownItemWithDeletionModal } from './dropdown-item-with-deletion-modal'

export interface RemoveNoteEntryItemProps {
  onConfirm: () => void
  noteTitle: string
}

export const RemoveNoteEntryItem: React.FC<RemoveNoteEntryItemProps> = ({ noteTitle, onConfirm }) => {
  return (
    <DropdownItemWithDeletionModal
      onConfirm={ onConfirm }
      itemI18nKey={ 'landing.history.menu.removeEntry' }
      modalButtonI18nKey={ 'landing.history.modal.removeNote.button' }
      modalIcon={ 'archive' }
      modalTitleI18nKey={ 'landing.history.modal.removeNote.title' }
      modalQuestionI18nKey={ 'landing.history.modal.removeNote.question' }
      modalWarningI18nKey={ 'landing.history.modal.removeNote.warning' }
      noteTitle={ noteTitle }/>
  )
}
