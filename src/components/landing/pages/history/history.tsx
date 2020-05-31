import React, { Fragment, useEffect, useState } from 'react'
import { Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { loadHistoryFromLocalStore, setHistoryToLocalStore, sortAndFilterEntries } from '../../../../utils/historyUtils'
import { HistoryContent } from './history-content/history-content'
import { HistoryToolbar, HistoryToolbarState, initState as toolbarInitState } from './history-toolbar/history-toolbar'

export interface HistoryEntry {
  id: string,
  title: string,
  lastVisited: Date,
  tags: string[],
  pinned: boolean
}

export type pinClick = (entryId: string) => void;

export const History: React.FC = () => {
  useTranslation()
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
  const [viewState, setViewState] = useState<HistoryToolbarState>(toolbarInitState)

  useEffect(() => {
    const history = loadHistoryFromLocalStore()
    setHistoryEntries(history)
  }, [])

  useEffect(() => {
    if (historyEntries === []) {
      return
    }
    setHistoryToLocalStore(historyEntries)
  }, [historyEntries])

  const clearHistory = () => {
    setHistoryToLocalStore([])
    setHistoryEntries([])
  }

  const pinClick: pinClick = (entryId: string) => {
    setHistoryEntries((entries) => {
      return entries.map((entry) => {
        if (entry.id === entryId) {
          entry.pinned = !entry.pinned
        }
        return entry
      })
    })
  }

  const tags = historyEntries.map(entry => entry.tags)
    .reduce((a, b) => ([...a, ...b]), [])
    .filter((value, index, array) => {
      if (index === 0) {
        return true
      }
      return (value !== array[index - 1])
    })
  const entriesToShow = sortAndFilterEntries(historyEntries, viewState)

  return (
    <Fragment>
      <h1 className="mb-4"><Trans i18nKey="landing.navigation.history"/></h1>
      <Row className={'justify-content-center mt-5 mb-3'}>
        <HistoryToolbar
          onSettingsChange={setViewState}
          tags={tags}
          onClearHistory={clearHistory}
        />
      </Row>
      <HistoryContent viewState={viewState.viewState}
        entries={entriesToShow}
        onPinClick={pinClick}/>
    </Fragment>
  )
}
