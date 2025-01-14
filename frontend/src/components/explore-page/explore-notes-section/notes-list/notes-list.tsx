/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { NoteExploreEntryInterface, NoteType, SortMode } from '@hedgedoc/commons'
import type { Mode } from '../../mode-selection/mode'
import { getExplorePageEntries } from '../../../../api/explore'
import { NoteListEntry } from './note-entry'
import { Trans } from 'react-i18next'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'
import equal from 'fast-deep-equal'

export interface NotesListProps {
  mode: Mode
  sort: SortMode
  searchFilter: string | null
  typeFilter: NoteType | null
}

export const NotesList: React.FC<NotesListProps> = ({ mode, sort, searchFilter, typeFilter }) => {
  const [entries, setEntries] = useState<NoteExploreEntryInterface[]>([])
  const { showErrorNotification } = useUiNotifications()
  const [moreDataAvailable, setMoreDataAvailable] = useState(true)
  const lastPage = useRef<number>(0)
  const lastFilters = useRef({})

  const fetchNextPage = useCallback(
    (replaceOldEntries: boolean = false) => {
      lastFilters.current = { mode, sort, searchFilter, typeFilter }
      lastPage.current += 1
      getExplorePageEntries(mode, sort, searchFilter, typeFilter, lastPage.current)
        .then((data) => {
          if (data.length === 0) {
            setMoreDataAvailable(false)
            return
          }
          if (replaceOldEntries) {
            setEntries(data)
          } else {
            setEntries((prev) => [...prev, ...data])
          }
        })
        .catch(showErrorNotification('explore.errorLoadingEntries'))
    },
    [mode, sort, searchFilter, typeFilter, showErrorNotification]
  )

  const noteEntries = useMemo(() => {
    return entries.map((note) => {
      return <NoteListEntry {...note} key={note.primaryAlias} />
    })
  }, [entries])

  // Update entries when filters change
  useEffect(() => {
    if (!equal(lastFilters.current, { mode, sort, searchFilter, typeFilter })) {
      lastPage.current = 0
      setMoreDataAvailable(true)
      fetchNextPage(true)
    }
  }, [fetchNextPage, mode, sort, searchFilter, typeFilter])

  return (
    <InfiniteScroll
      dataLength={entries.length}
      next={fetchNextPage}
      hasMore={moreDataAvailable}
      loader={
        <div className={'text-center fs-3'}>
          <Trans i18nKey={'explore.loadingMore'} />
        </div>
      }
      endMessage={
        <div className={'text-center fs-4'}>
          <p>
            <Trans i18nKey={'explore.noMoreNotesFound'} />
          </p>
        </div>
      }>
      {noteEntries}
    </InfiniteScroll>
  )
}
