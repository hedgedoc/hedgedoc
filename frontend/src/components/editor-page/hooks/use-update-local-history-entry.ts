/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { HistoryEntryWithOrigin } from '../../../api/history/types'
import { HistoryEntryOrigin } from '../../../api/history/types'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { getGlobalState } from '../../../redux'
import { updateLocalHistoryEntry } from '../../../redux/history/methods'
import equal from 'fast-deep-equal'
import { useEffect, useRef } from 'react'

/**
 * An effect that uses information of the current note state to update a local {@link HistoryEntryWithOrigin history entry}.
 * The entry is updated when the title or tags of the note change.
 */
export const useUpdateLocalHistoryEntry = (): void => {
  const id = useApplicationState((state) => state.noteDetails?.id)
  const userExists = useApplicationState((state) => !!state.user)
  const currentNoteTitle = useApplicationState((state) => state.noteDetails?.title ?? '')
  const currentNoteTags = useApplicationState((state) => state.noteDetails?.frontmatter.tags ?? [])
  const currentNoteOwner = useApplicationState((state) => state.noteDetails?.permissions.owner)
  const lastNoteTitle = useRef('')
  const lastNoteTags = useRef<string[]>([])

  useEffect(() => {
    if (userExists || id === undefined) {
      return
    }
    if (currentNoteTitle === lastNoteTitle.current && equal(currentNoteTags, lastNoteTags.current)) {
      return
    }
    const history = getGlobalState().history
    const entry: HistoryEntryWithOrigin = history.find((entry) => entry.identifier === id) ?? {
      identifier: id,
      title: '',
      pinStatus: false,
      lastVisitedAt: '',
      tags: [],
      origin: HistoryEntryOrigin.LOCAL,
      owner: null
    }
    if (entry.origin === HistoryEntryOrigin.REMOTE) {
      return
    }
    const updatedEntry = { ...entry }
    updatedEntry.title = currentNoteTitle
    updatedEntry.tags = currentNoteTags
    updatedEntry.owner = currentNoteOwner
    updatedEntry.lastVisitedAt = new Date().toISOString()
    updateLocalHistoryEntry(id, updatedEntry)
    lastNoteTitle.current = currentNoteTitle
    lastNoteTags.current = currentNoteTags
  }, [id, userExists, currentNoteTitle, currentNoteTags, currentNoteOwner])
}
