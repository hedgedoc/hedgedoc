import React from 'react'
import { Table } from 'react-bootstrap'
import { HistoryTableRow } from './history-table-row'
import { HistoryEntriesProps } from '../history-content/history-content'
import { Trans, useTranslation } from 'react-i18next'
import { Pager } from '../../../../pagination/pager'

export const HistoryTable: React.FC<HistoryEntriesProps> = ({ entries, onPinClick, pageIndex, onLastPageIndexChange }) => {
  useTranslation()
  return (
    <Table striped bordered hover size="sm" variant="dark">
      <thead>
        <tr>
          <th><Trans i18nKey={'landing.history.tableHeader.title'}/></th>
          <th><Trans i18nKey={'landing.history.tableHeader.lastVisit'}/></th>
          <th><Trans i18nKey={'landing.history.tableHeader.tags'}/></th>
          <th><Trans i18nKey={'landing.history.tableHeader.actions'}/></th>
        </tr>
      </thead>
      <tbody>
        <Pager numberOfElementsPerPage={6} pageIndex={pageIndex} onLastPageIndexChange={onLastPageIndexChange}>
          {
            entries.map((entry) =>
              <HistoryTableRow
                key={entry.id}
                entry={entry}
                onPinClick={onPinClick}
              />)
          }
        </Pager>
      </tbody>
    </Table>
  )
}
