import React from 'react'
import { Row } from 'react-bootstrap'
import { Pager } from '../../common/pagination/pager'
import { HistoryEntriesProps } from '../history-content/history-content'
import { HistoryCard } from './history-card'

export const HistoryCardList: React.FC<HistoryEntriesProps> = ({ entries, onPinClick, onRemoveClick, onDeleteClick, pageIndex, onLastPageIndexChange }) => {
  return (
    <Row className="justify-content-start">
      <Pager numberOfElementsPerPage={9} pageIndex={pageIndex} onLastPageIndexChange={onLastPageIndexChange}>
        {
          entries.map((entry) => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              onPinClick={onPinClick}
              onRemoveClick={onRemoveClick}
              onDeleteClick={onDeleteClick}
            />))
        }
      </Pager>
    </Row>
  )
}
