/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createNumberRangeArray } from '../../../../common/number-range/number-range'

/**
 * Creates a Markdown table with the given size.
 *
 * @param rows The number of table rows
 * @param columns The number of table columns
 * @return The created Markdown table
 * @throws Error if an invalid table size was given
 */
export const createMarkdownTable = (rows: number, columns: number): string => {
  if (rows <= 0) {
    throw new Error(`Can't generate a table with ${rows} rows.`)
  } else if (columns <= 0) {
    throw new Error(`Can't generate a table with ${columns} columns.`)
  }
  const rowArray = createNumberRangeArray(rows)
  const colArray = createNumberRangeArray(columns).map((col) => col + 1)
  const head = '|  # ' + colArray.join(' |  # ') + ' |'
  const divider = '| ' + colArray.map(() => '----').join(' | ') + ' |'
  const body = rowArray.map(() => '| ' + colArray.map(() => '    ').join(' | ') + ' |').join('\n')
  return `${head}\n${divider}\n${body}`
}
