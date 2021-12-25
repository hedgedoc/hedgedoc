/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useMemo, useState } from 'react'
import { Alert, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { PagerPagination } from '../../common/pagination/pager-pagination'
import { HistoryCardList } from '../history-card/history-card-list'
import { HistoryTable } from '../history-table/history-table'
import { ViewStateEnum } from '../history-toolbar/history-toolbar'
import type { HistoryEntry } from '../../../redux/history/types'
import { removeHistoryEntry, toggleHistoryEntryPinning } from '../../../redux/history/methods'
import { deleteNote } from '../../../api/notes'
import { showErrorNotification } from '../../../redux/ui-notifications/methods'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { sortAndFilterEntries } from '../utils'
import { useHistoryToolbarState } from '../history-toolbar/toolbar-context/use-history-toolbar-state'

type OnEntryClick = (entryId: string) => void

export interface HistoryEventHandlers {
  onPinClick: OnEntryClick
  onRemoveClick: OnEntryClick
  onDeleteClick: OnEntryClick
}

export interface HistoryEntryProps {
  entry: HistoryEntry
}

export interface HistoryEntriesProps {
  entries: HistoryEntry[]
  pageIndex: number
  onLastPageIndexChange: (lastPageIndex: number) => void
}

export const HistoryContent: React.FC = () => {
  useTranslation()
  const [pageIndex, setPageIndex] = useState(0)
  const [lastPageIndex, setLastPageIndex] = useState(0)

  const allEntries = useApplicationState((state) => state.history)

  const [historyToolbarState] = useHistoryToolbarState()

  const entriesToShow = useMemo<HistoryEntry[]>(
    () => sortAndFilterEntries(allEntries, historyToolbarState),
    [allEntries, historyToolbarState]
  )

  const onPinClick = useCallback((noteId: string) => {
    toggleHistoryEntryPinning(noteId).catch(showErrorNotification('landing.history.error.updateEntry.text'))
  }, [])

  const onDeleteClick = useCallback((noteId: string) => {
    deleteNote(noteId)
      .then(() => removeHistoryEntry(noteId))
      .catch(showErrorNotification('landing.history.error.deleteNote.text'))
  }, [])

  const onRemoveClick = useCallback((noteId: string) => {
    removeHistoryEntry(noteId).catch(showErrorNotification('landing.history.error.deleteEntry.text'))
  }, [])

  const historyContent = useMemo(() => {
    switch (historyToolbarState.viewState) {
      case ViewStateEnum.TABLE:
        return (
          <HistoryTable
            entries={entriesToShow}
            onPinClick={onPinClick}
            onRemoveClick={onRemoveClick}
            onDeleteClick={onDeleteClick}
            pageIndex={pageIndex}
            onLastPageIndexChange={setLastPageIndex}
          />
        )
      case ViewStateEnum.CARD:
        return (
          <HistoryCardList
            entries={entriesToShow}
            onPinClick={onPinClick}
            onRemoveClick={onRemoveClick}
            onDeleteClick={onDeleteClick}
            pageIndex={pageIndex}
            onLastPageIndexChange={setLastPageIndex}
          />
        )
    }
  }, [entriesToShow, historyToolbarState.viewState, onDeleteClick, onPinClick, onRemoveClick, pageIndex])

  if (entriesToShow.length === 0) {
    return (
      <Row className={'justify-content-center'}>
        <Alert variant={'secondary'}>
          <Trans i18nKey={'landing.history.noHistory'} />
        </Alert>
      </Row>
    )
  } else {
    return (
      <Fragment>
        {historyContent}
        <Row className='justify-content-center'>
          <PagerPagination
            numberOfPageButtonsToShowAfterAndBeforeCurrent={2}
            lastPageIndex={lastPageIndex}
            onPageChange={setPageIndex}
          />
        </Row>
      </Fragment>
    )
  }
}
