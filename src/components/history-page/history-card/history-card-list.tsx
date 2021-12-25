/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Row } from 'react-bootstrap'
import { Pager } from '../../common/pagination/pager'
import type { HistoryEntriesProps, HistoryEventHandlers } from '../history-content/history-content'
import { HistoryCard } from './history-card'

export const HistoryCardList: React.FC<HistoryEntriesProps & HistoryEventHandlers> = ({
  entries,
  onPinClick,
  onRemoveClick,
  onDeleteClick,
  pageIndex,
  onLastPageIndexChange
}) => {
  return (
    <Row className='justify-content-start'>
      <Pager numberOfElementsPerPage={9} pageIndex={pageIndex} onLastPageIndexChange={onLastPageIndexChange}>
        {entries.map((entry) => (
          <HistoryCard
            key={entry.identifier}
            entry={entry}
            onPinClick={onPinClick}
            onRemoveClick={onRemoveClick}
            onDeleteClick={onDeleteClick}
          />
        ))}
      </Pager>
    </Row>
  )
}
