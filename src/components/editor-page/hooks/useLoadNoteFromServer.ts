/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getNote } from '../../../api/notes'
import { setNoteDataFromServer } from '../../../redux/note-details/methods'
import { Logger } from '../../../utils/logger'
import { useRouter } from 'next/router'
import { useAsync } from 'react-use'

const log = new Logger('Load Note From Server')

export const useLoadNoteFromServer = (): [boolean, boolean] => {
  const { query } = useRouter()

  const { loading, error } = useAsync(() => {
    const rawId = query.id
    if (rawId === undefined) {
      return Promise.reject('invalid id')
    }
    const id = typeof rawId === 'string' ? rawId : rawId[0]

    return getNote(id)
      .then((note) => {
        setNoteDataFromServer(note)
      })
      .catch((error: Error) => {
        log.error('Error while fetching note from server', error)
        return Promise.reject(error)
      })
  }, [query])

  return [error !== undefined, loading]
}
