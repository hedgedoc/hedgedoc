/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../utils/cypress-attribute'
import { parseCsv } from './csv-parser'
import React, { useMemo } from 'react'

export interface CsvTableProps {
  code: string
  delimiter: string
  showHeader: boolean
  tableRowClassName?: string
  tableColumnClassName?: string
}

/**
 * Renders a csv table.
 *
 * @param code The csv code
 * @param delimiter The delimiter to be used
 * @param showHeader If the header should be shown.
 * @param tableRowClassName Additional class name for the rows.
 * @param tableColumnClassNameA Additional class name for the columns.
 */
export const CsvTable: React.FC<CsvTableProps> = ({
  code,
  delimiter,
  showHeader,
  tableRowClassName,
  tableColumnClassName
}) => {
  const { rowsWithColumns, headerRow } = useMemo(() => {
    const rowsWithColumns = parseCsv(code.trim(), delimiter)
    const headerRow = showHeader ? rowsWithColumns.splice(0, 1)[0] : []
    return { rowsWithColumns, headerRow }
  }, [code, delimiter, showHeader])

  const renderTableHeader = useMemo(() => {
    return headerRow.length === 0 ? null : (
      <thead>
        <tr>
          {headerRow.map((column, columnNumber) => (
            <th key={`header-${columnNumber}`}>{column}</th>
          ))}
        </tr>
      </thead>
    )
  }, [headerRow])

  const renderTableBody = useMemo(
    () => (
      <tbody>
        {rowsWithColumns.map((row, rowNumber) => (
          <tr className={tableRowClassName} key={`row-${rowNumber}`}>
            {row.map((column, columnIndex) => (
              <td className={tableColumnClassName} key={`cell-${rowNumber}-${columnIndex}`}>
                {column.replace(/^"|"$/g, '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    ),
    [rowsWithColumns, tableColumnClassName, tableRowClassName]
  )

  return (
    <table className={'csv-html-table table-striped'} {...cypressId('csv-html-table')}>
      {renderTableHeader}
      {renderTableBody}
    </table>
  )
}
