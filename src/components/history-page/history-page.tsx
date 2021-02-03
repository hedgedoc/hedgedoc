/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { deleteHistory, deleteHistoryEntry, getHistory, setHistory, updateHistoryEntry } from '../../api/history'
import { deleteNote } from '../../api/notes'
import { ApplicationState } from '../../redux'
import { download } from '../common/download/download'
import { ErrorModal } from '../common/modals/error-modal'
import { HistoryContent } from './history-content/history-content'
import { HistoryToolbar, HistoryToolbarState, initState as toolbarInitState } from './history-toolbar/history-toolbar'

import {
  collectEntries,
  loadHistoryFromLocalStore,
  mergeEntryArrays,
  setHistoryToLocalStore,
  sortAndFilterEntries
} from './utils'

export interface HistoryEntry {
  id: string,
  title: string,
  lastVisited: string,
  tags: string[],
  pinned: boolean
}

export interface HistoryJson {
  version: number,
  entries: HistoryEntry[]
}

export type LocatedHistoryEntry = HistoryEntry & HistoryEntryLocation

export interface HistoryEntryLocation {
  location: HistoryEntryOrigin
}

export enum HistoryEntryOrigin {
  LOCAL = 'local',
  REMOTE = 'remote'
}

export const HistoryPage: React.FC = () => {
  useTranslation()
  const [localHistoryEntries, setLocalHistoryEntries] = useState<HistoryEntry[]>(loadHistoryFromLocalStore)
  const [remoteHistoryEntries, setRemoteHistoryEntries] = useState<HistoryEntry[]>([])
  const [toolbarState, setToolbarState] = useState<HistoryToolbarState>(toolbarInitState)
  const userExists = useSelector((state: ApplicationState) => !!state.user)
  const [error, setError] = useState('')

  const historyWrite = useCallback((entries: HistoryEntry[]) => {
    if (!entries) {
      return
    }
    setHistoryToLocalStore(entries)
  }, [])

  useEffect(() => {
    historyWrite(localHistoryEntries)
  }, [historyWrite, localHistoryEntries])

  const importHistory = useCallback((entries: HistoryEntry[]): void => {
    if (userExists) {
      setHistory(entries)
        .then(() => setRemoteHistoryEntries(entries))
        .catch(() => setError('setHistory'))
    } else {
      setLocalHistoryEntries(entries)
    }
  }, [userExists])

  const refreshHistory = useCallback(() => {
    const localHistory = loadHistoryFromLocalStore()
    setLocalHistoryEntries(localHistory)
    if (userExists) {
      getHistory()
        .then((remoteHistory) => setRemoteHistoryEntries(remoteHistory))
        .catch(() => setError('getHistory'))
    }
  }, [userExists])

  useEffect(() => {
    refreshHistory()
  }, [refreshHistory])

  const exportHistory = useCallback(() => {
    const dataObject: HistoryJson = {
      version: 2,
      entries: mergeEntryArrays(localHistoryEntries, remoteHistoryEntries)
    }
    download(JSON.stringify(dataObject), `history_${ (new Date()).getTime() }.json`, 'application/json')
  }, [localHistoryEntries, remoteHistoryEntries])

  const clearHistory = useCallback(() => {
    setLocalHistoryEntries([])
    if (userExists) {
      deleteHistory()
        .then(() => setRemoteHistoryEntries([]))
        .catch(() => setError('deleteHistory'))
    }
    historyWrite([])
  }, [historyWrite, userExists])

  const uploadAll = useCallback((): void => {
    const newHistory = mergeEntryArrays(localHistoryEntries, remoteHistoryEntries)
    if (userExists) {
      setHistory(newHistory)
        .then(() => {
          setRemoteHistoryEntries(newHistory)
          setLocalHistoryEntries([])
          historyWrite([])
        })
        .catch(() => setError('setHistory'))
    }
  }, [historyWrite, localHistoryEntries, remoteHistoryEntries, userExists])

  const removeFromHistoryClick = useCallback((entryId: string, location: HistoryEntryOrigin): void => {
    if (location === HistoryEntryOrigin.LOCAL) {
      setLocalHistoryEntries((entries) => entries.filter(entry => entry.id !== entryId))
    } else if (location === HistoryEntryOrigin.REMOTE) {
      deleteHistoryEntry(entryId)
        .then(() => setRemoteHistoryEntries((entries) => entries.filter(entry => entry.id !== entryId)))
        .catch(() => setError('deleteEntry'))
    }
  }, [])

  const deleteNoteClick = useCallback((entryId: string, location: HistoryEntryOrigin): void => {
    if (userExists) {
      deleteNote(entryId)
        .then(() => {
          removeFromHistoryClick(entryId, location)
        })
        .catch(() => setError('deleteNote'))
    }
  }, [userExists, removeFromHistoryClick])

  const pinClick = useCallback((entryId: string, location: HistoryEntryOrigin): void => {
    if (location === HistoryEntryOrigin.LOCAL) {
      setLocalHistoryEntries((entries) => {
        return entries.map((entry) => {
          if (entry.id === entryId) {
            entry.pinned = !entry.pinned
          }
          return entry
        })
      })
    } else if (location === HistoryEntryOrigin.REMOTE) {
      const foundEntry = remoteHistoryEntries.find(entry => entry.id === entryId)
      if (!foundEntry) {
        setError('notFoundEntry')
        return
      }
      const changedEntry = {
        ...foundEntry,
        pinned: !foundEntry.pinned
      }
      updateHistoryEntry(entryId, changedEntry)
        .then(() => setRemoteHistoryEntries((entries) => (
            entries.map((entry) => {
              if (entry.id === entryId) {
                entry.pinned = !entry.pinned
              }
              return entry
            })
          )
        ))
        .catch(() => setError('updateEntry'))
    }
  }, [remoteHistoryEntries])

  const resetError = () => {
    setError('')
  }

  const allEntries = useMemo(() => {
    return collectEntries(localHistoryEntries, remoteHistoryEntries)
  }, [localHistoryEntries, remoteHistoryEntries])

  const tags = useMemo<string[]>(() => {
    return allEntries.map(entry => entry.tags)
                     .reduce((a, b) => ([...a, ...b]), [])
                     .filter((value, index, array) => {
                       if (index === 0) {
                         return true
                       }
                       return (value !== array[index - 1])
                     })
  }, [allEntries])

  const entriesToShow = useMemo<LocatedHistoryEntry[]>(() =>
      sortAndFilterEntries(allEntries, toolbarState),
    [allEntries, toolbarState])

  return <Fragment>
    <ErrorModal show={ error !== '' } onHide={ resetError }
                titleI18nKey={ error !== '' ? `landing.history.error.${ error }.title` : '' }>
      <h5>
        <Trans i18nKey={ error !== '' ? `landing.history.error.${ error }.text` : '' }/>
      </h5>
    </ErrorModal>
    <h1 className="mb-4"><Trans i18nKey="landing.navigation.history"/></h1>
    <Row className={ 'justify-content-center mt-5 mb-3' }>
      <HistoryToolbar
        onSettingsChange={ setToolbarState }
        tags={ tags }
        onClearHistory={ clearHistory }
        onRefreshHistory={ refreshHistory }
        onExportHistory={ exportHistory }
        onImportHistory={ importHistory }
        onUploadAll={ uploadAll }
      />
    </Row>
    <HistoryContent
      viewState={ toolbarState.viewState }
      entries={ entriesToShow }
      onPinClick={ pinClick }
      onRemoveClick={ removeFromHistoryClick }
      onDeleteClick={ deleteNoteClick }
    />
  </Fragment>
}
