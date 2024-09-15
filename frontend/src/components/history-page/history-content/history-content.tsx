/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { HistoryEntryWithOrigin } from '../../../api/history/types'
import { deleteNote } from '../../../api/notes'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { removeHistoryEntry, toggleHistoryEntryPinning } from '../../../redux/history/methods'
import { PagerPagination } from '../../common/pagination/pager-pagination'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import { HistoryCardList } from '../history-card/history-card-list'
import { HistoryTable } from '../history-table/history-table'
import { ViewStateEnum } from '../history-toolbar/history-toolbar'
import { useHistoryToolbarState } from '../history-toolbar/toolbar-context/use-history-toolbar-state'
import { sortAndFilterEntries } from '../utils'
import React, { Fragment, useCallback, useMemo, useState } from 'react'
import { Alert, Col, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

type OnEntryClick = (entryId: string) => void

export interface HistoryEventHandlers {
  onPinClick: OnEntryClick
  onRemoveEntryClick: OnEntryClick
  onDeleteNoteClick: (entryId: string, keepMedia: boolean) => void
}

export interface HistoryEntryProps {
  entry: HistoryEntryWithOrigin
}

export interface HistoryEntriesProps {
  entries: HistoryEntryWithOrigin[]
  pageIndex: number
  onLastPageIndexChange: (lastPageIndex: number) => void
}

/**
 * Renders the content of the history based on the current history toolbar state.
 */
export const HistoryContent: React.FC = () => {
  useTranslation()
  const [pageIndex, setPageIndex] = useState(0)
  const [lastPageIndex, setLastPageIndex] = useState(0)

  const allEntries = useApplicationState((state) => state.history)
  const [historyToolbarState] = useHistoryToolbarState()
  const { showErrorNotification } = useUiNotifications()

  const entriesToShow = useMemo<HistoryEntryWithOrigin[]>(
    () => sortAndFilterEntries(allEntries, historyToolbarState),
    [allEntries, historyToolbarState]
  )

  const onPinClick = useCallback(
    (noteId: string) => {
      toggleHistoryEntryPinning(noteId).catch(showErrorNotification('landing.history.error.updateEntry.text'))
    },
    [showErrorNotification]
  )

  const onDeleteClick = useCallback(
    (noteId: string, keepMedia: boolean) => {
      deleteNote(noteId, keepMedia)
        .then(() => removeHistoryEntry(noteId))
        .catch(showErrorNotification('landing.history.error.deleteNote.text'))
    },
    [showErrorNotification]
  )

  const onRemoveClick = useCallback(
    (noteId: string) => {
      removeHistoryEntry(noteId).catch(showErrorNotification('landing.history.error.deleteEntry.text'))
    },
    [showErrorNotification]
  )

  const historyContent = useMemo(() => {
    switch (historyToolbarState.viewState) {
      case ViewStateEnum.TABLE:
        return (
          <HistoryTable
            entries={entriesToShow}
            onPinClick={onPinClick}
            onRemoveEntryClick={onRemoveClick}
            onDeleteNoteClick={onDeleteClick}
            pageIndex={pageIndex}
            onLastPageIndexChange={setLastPageIndex}
          />
        )
      case ViewStateEnum.CARD:
        return (
          <HistoryCardList
            entries={entriesToShow}
            onPinClick={onPinClick}
            onRemoveEntryClick={onRemoveClick}
            onDeleteNoteClick={onDeleteClick}
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
        <Row>
          <Col className={'justify-content-center d-flex'}>
            <PagerPagination
              numberOfPageButtonsToShowAfterAndBeforeCurrent={2}
              lastPageIndex={lastPageIndex}
              onPageChange={setPageIndex}
            />
          </Col>
        </Row>
      </Fragment>
    )
  }
}
