/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import equal from 'fast-deep-equal'
import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { ApplicationState, store } from '../../../redux'
import { useParams } from 'react-router-dom'
import { EditorPagePathParams } from '../editor-page'
import { HistoryEntry, HistoryEntryOrigin } from '../../../redux/history/types'
import { updateLocalHistoryEntry } from '../../../redux/history/methods'

export const useUpdateLocalHistoryEntry = (updateReady: boolean): void => {
  const { id } = useParams<EditorPagePathParams>()
  const userExists = useSelector((state: ApplicationState) => !!state.user)
  const currentNoteTitle = useSelector((state: ApplicationState) => state.noteDetails.noteTitle)
  const currentNoteTags = useSelector((state: ApplicationState) => state.noteDetails.frontmatter.tags)

  const lastNoteTitle = useRef('')
  const lastNoteTags = useRef<string[]>([])

  useEffect(() => {
    if (!updateReady || userExists) {
      return
    }
    if (currentNoteTitle === lastNoteTitle.current && equal(currentNoteTags, lastNoteTags.current)) {
      return
    }
    const history = store.getState().history
    const entry: HistoryEntry = history.find((entry) => entry.identifier === id) ?? {
      identifier: id,
      title: '',
      pinStatus: false,
      lastVisited: '',
      tags: [],
      origin: HistoryEntryOrigin.LOCAL
    }
    if (entry.origin === HistoryEntryOrigin.REMOTE) {
      return
    }
    entry.title = currentNoteTitle
    entry.tags = currentNoteTags
    entry.lastVisited = new Date().toISOString()
    updateLocalHistoryEntry(id, entry)
    lastNoteTitle.current = currentNoteTitle
    lastNoteTags.current = currentNoteTags
  }, [updateReady, id, userExists, currentNoteTitle, currentNoteTags])
}
