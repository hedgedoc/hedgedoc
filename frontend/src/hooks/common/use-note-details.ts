/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteDetails } from '../../redux/note-details/types/note-details'
import { useApplicationState } from './use-application-state'

export const useNoteDetails = (): NoteDetails => {
  const noteDetails = useApplicationState((state) => state.noteDetails)

  if (noteDetails === null) {
    throw new Error('No note details in global application state!')
  }

  return noteDetails
}
