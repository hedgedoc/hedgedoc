/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DropdownItemWithDeletionModal } from './dropdown-item-with-deletion-modal'
import React from 'react'

export interface DeleteNoteItemProps {
  onConfirm: () => void
  noteTitle: string
}

/**
 * Renders a dropdown item for the {@link EntryMenu history entry menu} that allows to delete the note of the entry.
 *
 * @param noteTitle The title of the note to delete to show it in the deletion confirmation modal
 * @param onConfirm The callback that is fired when the deletion is confirmed
 */
export const DeleteNoteItem: React.FC<DeleteNoteItemProps> = ({ noteTitle, onConfirm }) => {
  return (
    <DropdownItemWithDeletionModal
      onConfirm={onConfirm}
      itemI18nKey={'landing.history.menu.deleteNote'}
      modalIcon={'trash'}
      noteTitle={noteTitle}
    />
  )
}
