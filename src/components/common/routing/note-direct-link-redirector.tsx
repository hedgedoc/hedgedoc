/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router'
import { useParams } from 'react-router-dom'
import { getNote } from '../../../api/notes'
import { NotFoundErrorScreen } from './not-found-error-screen'
import type { NoteDto } from '../../../api/notes/types'

interface RouteParameters {
  id: string
}

/**
 * Redirects the user to the editor if the link is a root level direct link to a version 1 note.
 */
export const NoteDirectLinkRedirector: React.FC = () => {
  const { id } = useParams<RouteParameters>()
  const [error, setError] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    getNote(id)
      .then((noteFromAPI: NoteDto) => setError(noteFromAPI.metadata.version !== 1))
      .catch(() => setError(true))
  }, [id])

  if (error === true) {
    return <NotFoundErrorScreen />
  } else if (error === false) {
    return <Redirect to={`/n/${id}`} />
  } else {
    return <span>Loading</span>
  }
}
