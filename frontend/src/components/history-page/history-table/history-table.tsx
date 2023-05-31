/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDarkModeState } from '../../../hooks/dark-mode/use-dark-mode-state'
import { cypressId } from '../../../utils/cypress-attribute'
import { Pager } from '../../common/pagination/pager'
import type { HistoryEntriesProps, HistoryEventHandlers } from '../history-content/history-content'
import { HistoryTableRow } from './history-table-row'
import styles from './history-table.module.scss'
import React, { useMemo } from 'react'
import { Table } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders a paginated table of history entries.
 *
 * @param entries The history entries to render.
 * @param onPinClick Callback that is fired when the pinning button was clicked for an entry.
 * @param onRemoveEntryClick Callback that is fired when the entry removal button was clicked for an entry.
 * @param onDeleteNoteClick Callback that is fired when the note deletion button was clicked for an entry.
 * @param pageIndex The currently selected page.
 * @param onLastPageIndexChange Callback returning the last page index of the pager.
 */
export const HistoryTable: React.FC<HistoryEntriesProps & HistoryEventHandlers> = ({
  entries,
  onPinClick,
  onRemoveEntryClick,
  onDeleteNoteClick,
  pageIndex,
  onLastPageIndexChange
}) => {
  useTranslation()

  const tableRows = useMemo(() => {
    return entries.map((entry) => (
      <HistoryTableRow
        key={entry.identifier}
        entry={entry}
        onPinClick={onPinClick}
        onRemoveEntryClick={onRemoveEntryClick}
        onDeleteNoteClick={onDeleteNoteClick}
      />
    ))
  }, [entries, onPinClick, onRemoveEntryClick, onDeleteNoteClick])

  const darkModeState = useDarkModeState()

  return (
    <Table
      striped
      bordered
      hover
      size='sm'
      variant={darkModeState ? 'dark' : 'light'}
      className={styles['history-table']}
      {...cypressId('history-table')}>
      <thead>
        <tr>
          <th>
            <Trans i18nKey={'landing.history.tableHeader.title'} />
          </th>
          <th>
            <Trans i18nKey={'landing.history.tableHeader.lastVisit'} />
          </th>
          <th>
            <Trans i18nKey={'landing.history.tableHeader.tags'} />
          </th>
          <th>
            <Trans i18nKey={'landing.history.tableHeader.actions'} />
          </th>
        </tr>
      </thead>
      <tbody>
        <Pager numberOfElementsPerPage={12} pageIndex={pageIndex} onLastPageIndexChange={onLastPageIndexChange}>
          {tableRows}
        </Pager>
      </tbody>
    </Table>
  )
}
