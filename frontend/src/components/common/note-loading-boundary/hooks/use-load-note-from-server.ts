/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getNote } from '../../../../api/notes'
import { useSingleStringUrlParameter } from '../../../../hooks/common/use-single-string-url-parameter'
import { setNoteDataFromServer } from '../../../../redux/note-details/methods'
import { useAsyncFn } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

/**
 * Reads the note id from the current URL, requests the note from the backend and writes it into the global application state.
 *
 * @return An {@link AsyncState async state} that represents the current state of the loading process.
 */
export const useLoadNoteFromServer = (): [AsyncState<boolean>, () => void] => {
  const id = useSingleStringUrlParameter('noteId', undefined)

  return useAsyncFn(async (): Promise<boolean> => {
    if (id === undefined) {
      throw new Error('Invalid id')
    }
    const noteFromServer = await getNote(id)
    setNoteDataFromServer(noteFromServer)
    return true
  }, [id])
}
