/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useState } from 'react'
import { Alert, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { PagerPagination } from '../../common/pagination/pager-pagination'
import { HistoryCardList } from '../history-card/history-card-list'
import { HistoryTable } from '../history-table/history-table'
import { ViewStateEnum } from '../history-toolbar/history-toolbar'
import { HistoryEntry } from '../../../redux/history/types'
import { removeHistoryEntry, toggleHistoryEntryPinning } from '../../../redux/history/methods'
import { deleteNote } from '../../../api/notes'
import { showErrorNotification } from '../../../redux/ui-notifications/methods'

type OnEntryClick = (entryId: string) => void

export interface HistoryEventHandlers {
  onPinClick: OnEntryClick
  onRemoveClick: OnEntryClick
  onDeleteClick: OnEntryClick
}

export interface HistoryContentProps {
  viewState: ViewStateEnum
  entries: HistoryEntry[]
}

export interface HistoryEntryProps {
  entry: HistoryEntry,
}

export interface HistoryEntriesProps {
  entries: HistoryEntry[]
  pageIndex: number
  onLastPageIndexChange: (lastPageIndex: number) => void
}

export const HistoryContent: React.FC<HistoryContentProps> = ({ viewState, entries }) => {
  const { t } = useTranslation()

  const [pageIndex, setPageIndex] = useState(0)
  const [lastPageIndex, setLastPageIndex] = useState(0)

  const onPinClick = useCallback((noteId: string) => {
    toggleHistoryEntryPinning(noteId)
      .catch(showErrorNotification(t('landing.history.error.updateEntry.text')))
  }, [t])

  const onDeleteClick = useCallback((noteId: string) => {
    deleteNote(noteId)
      .then(() => removeHistoryEntry(noteId))
      .catch(showErrorNotification(t('landing.history.error.deleteNote.text')))
  }, [t])

  const onRemoveClick = useCallback((noteId: string) => {
    removeHistoryEntry(noteId)
      .catch(showErrorNotification(t('landing.history.error.deleteEntry.text')))
  }, [t])

  if (entries.length === 0) {
    return (
      <Row className={ 'justify-content-center' }>
        <Alert variant={ 'secondary' }>
          <Trans i18nKey={ 'landing.history.noHistory' }/>
        </Alert>
      </Row>
    )
  }

  const mapViewStateToComponent = (viewState: ViewStateEnum) => {
    switch (viewState) {
      case ViewStateEnum.TABLE:
        return <HistoryTable entries={ entries }
                             onPinClick={ onPinClick }
                             onRemoveClick={ onRemoveClick }
                             onDeleteClick={ onDeleteClick }
                             pageIndex={ pageIndex }
                             onLastPageIndexChange={ setLastPageIndex }/>
      case ViewStateEnum.CARD:
      default:
        return <HistoryCardList entries={ entries }
                                onPinClick={ onPinClick }
                                onRemoveClick={ onRemoveClick }
                                onDeleteClick={ onDeleteClick }
                                pageIndex={ pageIndex }
                                onLastPageIndexChange={ setLastPageIndex }/>
    }
  }

  return (
    <Fragment>
      { mapViewStateToComponent(viewState) }
      <Row className="justify-content-center">
        <PagerPagination numberOfPageButtonsToShowAfterAndBeforeCurrent={ 2 } lastPageIndex={ lastPageIndex }
                         onPageChange={ setPageIndex }/>
      </Row>
    </Fragment>)
}
