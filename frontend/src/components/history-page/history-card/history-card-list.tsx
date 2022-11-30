/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Pager } from '../../common/pagination/pager'
import type { HistoryEntriesProps, HistoryEventHandlers } from '../history-content/history-content'
import { HistoryCard } from './history-card'
import React, { useMemo } from 'react'
import { Row } from 'react-bootstrap'

/**
 * Renders a paginated list of history entry cards.
 *
 * @param entries The history entries to render.
 * @param onPinClick Callback that is fired when the pinning button was clicked for an entry.
 * @param onRemoveEntryClick Callback that is fired when the entry removal button was clicked for an entry.
 * @param onDeleteNoteClick Callback that is fired when the note deletion button was clicked for an entry.
 * @param pageIndex The currently selected page.
 * @param onLastPageIndexChange Callback returning the last page index of the pager.
 */
export const HistoryCardList: React.FC<HistoryEntriesProps & HistoryEventHandlers> = ({
  entries,
  onPinClick,
  onRemoveEntryClick,
  onDeleteNoteClick,
  pageIndex,
  onLastPageIndexChange
}) => {
  const entryCards = useMemo(() => {
    return entries.map((entry) => (
      <HistoryCard
        key={entry.identifier}
        entry={entry}
        onPinClick={onPinClick}
        onRemoveEntryClick={onRemoveEntryClick}
        onDeleteNoteClick={onDeleteNoteClick}
      />
    ))
  }, [entries, onPinClick, onRemoveEntryClick, onDeleteNoteClick])

  return (
    <Row className='justify-content-start'>
      <Pager numberOfElementsPerPage={9} pageIndex={pageIndex} onLastPageIndexChange={onLastPageIndexChange}>
        {entryCards}
      </Pager>
    </Row>
  )
}
