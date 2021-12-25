/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Table } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { Pager } from '../../common/pagination/pager'
import type { HistoryEntriesProps, HistoryEventHandlers } from '../history-content/history-content'
import { HistoryTableRow } from './history-table-row'
import styles from './history-table.module.scss'
import { cypressId } from '../../../utils/cypress-attribute'

export const HistoryTable: React.FC<HistoryEntriesProps & HistoryEventHandlers> = ({
  entries,
  onPinClick,
  onRemoveClick,
  onDeleteClick,
  pageIndex,
  onLastPageIndexChange
}) => {
  useTranslation()
  return (
    <Table
      striped
      bordered
      hover
      size='sm'
      variant='dark'
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
          {entries.map((entry) => (
            <HistoryTableRow
              key={entry.identifier}
              entry={entry}
              onPinClick={onPinClick}
              onRemoveClick={onRemoveClick}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </Pager>
      </tbody>
    </Table>
  )
}
