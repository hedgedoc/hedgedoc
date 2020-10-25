import React, { Fragment, useState } from 'react'
import { Alert, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { PagerPagination } from '../../common/pagination/pager-pagination'
import { HistoryEntryOrigin, LocatedHistoryEntry } from '../history-page'
import { HistoryCardList } from '../history-card/history-card-list'
import { HistoryTable } from '../history-table/history-table'
import { ViewStateEnum } from '../history-toolbar/history-toolbar'

type OnEntryClick = (entryId: string, location: HistoryEntryOrigin) => void

export interface HistoryContentProps {
  viewState: ViewStateEnum
  entries: LocatedHistoryEntry[]
  onPinClick: OnEntryClick
  onRemoveClick: OnEntryClick
  onDeleteClick: OnEntryClick
}

export interface HistoryEntryProps {
  entry: LocatedHistoryEntry,
  onPinClick: OnEntryClick
  onRemoveClick: OnEntryClick
  onDeleteClick: OnEntryClick
}

export interface HistoryEntriesProps {
    entries: LocatedHistoryEntry[]
    onPinClick: OnEntryClick
    onRemoveClick: OnEntryClick
    onDeleteClick: OnEntryClick
    pageIndex: number
    onLastPageIndexChange: (lastPageIndex: number) => void
}

export const HistoryContent: React.FC<HistoryContentProps> = ({ viewState, entries, onPinClick, onRemoveClick, onDeleteClick }) => {
  useTranslation()
  const [pageIndex, setPageIndex] = useState(0)
  const [lastPageIndex, setLastPageIndex] = useState(0)

  if (entries.length === 0) {
    return (
      <Row className={'justify-content-center'}>
        <Alert variant={'secondary'}>
          <Trans i18nKey={'landing.history.noHistory'}/>
        </Alert>
      </Row>
    )
  }

  const mapViewStateToComponent = (viewState: ViewStateEnum) => {
    switch (viewState) {
      case ViewStateEnum.TABLE:
        return <HistoryTable entries={entries}
          onPinClick={onPinClick}
          onRemoveClick={onRemoveClick}
          onDeleteClick={onDeleteClick}
          pageIndex={pageIndex}
          onLastPageIndexChange={setLastPageIndex}/>
      case ViewStateEnum.CARD:
      default:
        return <HistoryCardList entries={entries}
          onPinClick={onPinClick}
          onRemoveClick={onRemoveClick}
          onDeleteClick={onDeleteClick}
          pageIndex={pageIndex}
          onLastPageIndexChange={setLastPageIndex}/>
    }
  }

  return (
    <Fragment>
      {mapViewStateToComponent(viewState)}
      <Row className="justify-content-center">
        <PagerPagination numberOfPageButtonsToShowAfterAndBeforeCurrent={2} lastPageIndex={lastPageIndex}
          onPageChange={setPageIndex}/>
      </Row>
    </Fragment>)
}
