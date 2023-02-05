/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../utils/cypress-attribute'
import { DropdownItemWithDeletionModal } from './dropdown-item-with-deletion-modal'
import React from 'react'
import { Archive as IconArchive } from 'react-bootstrap-icons'

export interface RemoveNoteEntryItemProps {
  onConfirm: () => void
  noteTitle: string
}

/**
 * Renders a menu item for note deletion with a modal for confirmation.
 *
 * @param noteTitle The title of the note
 * @param onConfirm The callback to delete the note
 */
export const RemoveNoteEntryItem: React.FC<RemoveNoteEntryItemProps> = ({ noteTitle, onConfirm }) => {
  return (
    <DropdownItemWithDeletionModal
      onConfirm={onConfirm}
      itemI18nKey={'landing.history.menu.removeEntry'}
      modalButtonI18nKey={'landing.history.modal.removeNote.button'}
      modalIcon={IconArchive}
      modalTitleI18nKey={'landing.history.modal.removeNote.title'}
      modalQuestionI18nKey={'landing.history.modal.removeNote.question'}
      modalWarningI18nKey={'landing.history.modal.removeNote.warning'}
      noteTitle={noteTitle}
      {...cypressId('history-entry-menu-remove-button')}
    />
  )
}
