import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { deleteHistory, getHistory, setHistory } from '../../../../api/history'
import { ApplicationState } from '../../../../redux'
import {
  collectEntries,
  downloadHistory,
  loadHistoryFromLocalStore,
  mergeEntryArrays,
  setHistoryToLocalStore,
  sortAndFilterEntries
} from '../../../../utils/historyUtils'
import { ErrorModal } from '../../../error-modal/error-modal'
import { HistoryContent } from './history-content/history-content'
import { HistoryToolbar, HistoryToolbarState, initState as toolbarInitState } from './history-toolbar/history-toolbar'

export interface HistoryEntry {
  id: string,
  title: string,
  lastVisited: Date,
  tags: string[],
  pinned: boolean
}

export interface HistoryJson {
  version: number,
  entries: HistoryEntry[]
}

export type LocatedHistoryEntry = HistoryEntry & HistoryEntryLocation

export interface HistoryEntryLocation {
  location: Location
}

export enum Location {
  LOCAL = 'local',
  REMOTE = 'remote'
}

export const History: React.FC = () => {
  useTranslation()
  const [localHistoryEntries, setLocalHistoryEntries] = useState<HistoryEntry[]>(loadHistoryFromLocalStore)
  const [remoteHistoryEntries, setRemoteHistoryEntries] = useState<HistoryEntry[]>([])
  const [toolbarState, setToolbarState] = useState<HistoryToolbarState>(toolbarInitState)
  const user = useSelector((state: ApplicationState) => state.user)
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
    if (user) {
      setHistory(entries)
        .then(() => setRemoteHistoryEntries(entries))
        .catch(() => setError('setHistory'))
    } else {
      historyWrite(entries)
      setLocalHistoryEntries(entries)
    }
  }, [historyWrite, user])

  const refreshHistory = useCallback(() => {
    const localHistory = loadHistoryFromLocalStore()
    setLocalHistoryEntries(localHistory)
    if (user) {
      getHistory()
        .then((remoteHistory) => setRemoteHistoryEntries(remoteHistory))
        .catch(() => setError('getHistory'))
    }
  }, [user])

  useEffect(() => {
    refreshHistory()
  }, [refreshHistory])

  const exportHistory = useCallback(() => {
    const dataObject: HistoryJson = {
      version: 2,
      entries: mergeEntryArrays(localHistoryEntries, remoteHistoryEntries)
    }
    downloadHistory(dataObject)
  }, [localHistoryEntries, remoteHistoryEntries])

  const clearHistory = useCallback(() => {
    setLocalHistoryEntries([])
    if (user) {
      deleteHistory()
        .then(() => setRemoteHistoryEntries([]))
        .catch(() => setError('deleteHistory'))
    }
    historyWrite([])
  }, [historyWrite, user])

  const syncClick = useCallback((entryId: string): void => {
    console.log(entryId)
    // ToDo: add syncClick
  }, [])

  const pinClick = useCallback((entryId: string): void => {
    // ToDo: determine if entry is local or remote
    setLocalHistoryEntries((entries) => {
      return entries.map((entry) => {
        if (entry.id === entryId) {
          entry.pinned = !entry.pinned
        }
        return entry
      })
    })
  }, [])

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

  return (
    <Fragment>
      <ErrorModal show={error !== ''} onHide={resetError}
        title={error !== '' ? `landing.history.error.${error}.title` : ''}>
        <h5>
          <Trans i18nKey={error !== '' ? `landing.history.error.${error}.text` : ''}/>
        </h5>
      </ErrorModal>
      <h1 className="mb-4"><Trans i18nKey="landing.navigation.history"/></h1>
      <Row className={'justify-content-center mt-5 mb-3'}>
        <HistoryToolbar
          onSettingsChange={setToolbarState}
          tags={tags}
          onClearHistory={clearHistory}
          onRefreshHistory={refreshHistory}
          onExportHistory={exportHistory}
          onImportHistory={importHistory}
        />
      </Row>
      <HistoryContent viewState={toolbarState.viewState}
        entries={entriesToShow}
        onPinClick={pinClick}
        onSyncClick={syncClick}
      />
    </Fragment>
  )
}
