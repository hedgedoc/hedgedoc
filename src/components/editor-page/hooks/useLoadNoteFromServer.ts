/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { getNote } from '../../../api/notes'
import { setNoteDataFromServer } from '../../../redux/note-details/methods'
import { EditorPagePathParams } from '../editor-page'

export const useLoadNoteFromServer = (): [boolean, boolean] => {
  const { id } = useParams<EditorPagePathParams>()

  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNote(id)
      .then(note => {
        setNoteDataFromServer(note)
      })
      .catch((e) => {
        setError(true)
        console.error(e)
      })
      .finally(() => setLoading(false))
  }, [id])

  return [error, loading]
}
