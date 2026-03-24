'use client'
/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FolderInterface, NoteExploreEntryInterface, NoteType, SortMode } from '@hedgedoc/commons'
import { Mode } from '../../mode-selection/mode'
import { getExplorePageEntries } from '../../../../api/explore'
import { NoteListEntry } from './note-entry'
import { Trans } from 'react-i18next'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import equal from 'fast-deep-equal'
import { getFolders } from '../../../../api/folders'

export interface NotesListProps {
  mode: Mode
  sort: SortMode
  searchFilter: string | null
  typeFilter: NoteType | null
  folderId: number | null
}

/**
 * Renders the infinite scroll list of notes matching the given filter criteria.
 *
 * @param mode The access mode to use, for example whether to show only recently visited notes or all public notes.
 * @param sort The sorting mode to use, for example whether to sort by last changed date or by title.
 * @param searchFilter An optional search filter to apply, e.g. to filter for notes containing a specific string.
 * @param typeFilter An optional note type filter to apply, e.g. to show only documents or only slides.
 */
export const NotesList: React.FC<NotesListProps> = ({ mode, sort, searchFilter, typeFilter, folderId }) => {
  const [entries, setEntries] = useState<NoteExploreEntryInterface[]>([])
  const [folders, setFolders] = useState<FolderInterface[]>([])
  const { showErrorNotificationBuilder } = useUiNotifications()
  const [moreDataAvailable, setMoreDataAvailable] = useState(true)
  const lastPage = useRef<number>(0)
  const lastFilters = useRef({})
  const pinnedNotes = useApplicationState((state) => state.pinnedNotes)

  const fetchNextPage = useCallback(
    (replaceOldEntries: boolean = false) => {
      lastFilters.current = { mode, sort, searchFilter, typeFilter, folderId }
      lastPage.current += 1
      getExplorePageEntries(mode, sort, searchFilter, typeFilter, lastPage.current, folderId ?? undefined)
        .then((data) => {
          if (data.length === 0) {
            setMoreDataAvailable(false)
            if (replaceOldEntries) {
              setEntries([])
            }
            return
          }
          if (replaceOldEntries) {
            setEntries(data)
          } else {
            setEntries((prev) => [...prev, ...data])
          }
        })
        .catch(showErrorNotificationBuilder('explore.errorLoadingEntries'))
    },
    [mode, sort, searchFilter, typeFilter, folderId, showErrorNotificationBuilder]
  )

  const updateExplorePage = useCallback(() => {
    lastPage.current = 0
    setMoreDataAvailable(true)
    fetchNextPage(true)
  }, [setMoreDataAvailable, fetchNextPage])

  const updateFolderCache = useCallback(() => {
    getFolders().then(setFolders).catch(showErrorNotificationBuilder('Failed to load folders'))
  }, [showErrorNotificationBuilder])

  const folderPathMap = useMemo(() => {
    const byId = new Map<number, FolderInterface>()
    for (const folder of folders) {
      byId.set(folder.id, folder)
    }

    const pathById = new Map<number, string>()
    for (const folder of folders) {
      const segments: string[] = []
      let current: FolderInterface | undefined = folder
      while (current) {
        segments.unshift(current.name)
        current = current.parentFolderId === null ? undefined : byId.get(current.parentFolderId)
      }
      pathById.set(folder.id, segments.join(' / '))
    }

    return pathById
  }, [folders])

  const noteEntries = useMemo(() => {
    return entries.map((note) => {
      const isPinned = pinnedNotes[note.primaryAlias] !== undefined
      return (
        <NoteListEntry
          {...note}
          folderPath={note.folderId === null ? undefined : folderPathMap.get(note.folderId)}
          key={note.primaryAlias}
          isPinned={isPinned}
          showLastVisitedTime={mode === Mode.VISITED}
          updateExplorePage={updateExplorePage}
        />
      )
    })
  }, [entries, folderPathMap, mode, pinnedNotes, updateExplorePage])

  // Update entries when filters change
  useEffect(() => {
    if (!equal(lastFilters.current, { mode, sort, searchFilter, typeFilter, folderId })) {
      updateExplorePage()
    }
  }, [updateExplorePage, mode, sort, searchFilter, typeFilter, folderId])

  // Load folders once to show folder paths under note titles.
  useEffect(() => {
    updateFolderCache()
  }, [updateFolderCache])

  // Refetch when the user returns to this tab (e.g. after editing a note)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateExplorePage()
        updateFolderCache()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [updateExplorePage, updateFolderCache])

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
