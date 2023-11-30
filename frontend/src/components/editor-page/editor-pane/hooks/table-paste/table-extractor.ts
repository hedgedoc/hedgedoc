/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createNumberRangeArray } from '../../../../common/number-range/number-range'

/**
 * Checks if the given text is a tab-and-new-line-separated table.
 *
 * @param text The text to check
 * @return If the text is a table or not
 */
export const isTable = (text: string): boolean => {
  // Tables must consist of multiple rows and columns
  if (!text.includes('\n') || !text.includes('\t')) {
    return false
  }
  // Code within code blocks should not be parsed as a table
  if (text.startsWith('```')) {
    return false
  }

  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '')

  // Tab-indented text should not be matched as a table
  if (lines.every((line) => line.startsWith('\t'))) {
    return false
  }
  // Every line should have the same amount of tabs (table columns)
  const tabsPerLines = lines.map((line) => line.match(/\t/g)?.length ?? 0)
  return tabsPerLines.every((line) => line === tabsPerLines[0])
}

/**
 * Reformat the given text as Markdown table.
 *
 * @param pasteData The plain text table separated by tabs and new-lines
 * @return the formatted Markdown table
 */
export const convertClipboardTableToMarkdown = (pasteData: string): string => {
  if (pasteData.trim() === '') {
    return ''
  }
  const tableRows = pasteData.split(/\r?\n/).filter((row) => row.trim() !== '')
  const tableCells = tableRows.reduce<string[][]>((cellsInRow, row, index) => {
    cellsInRow[index] = row.split('\t')
    return cellsInRow
  }, [])
  const arrayMaxRows = createNumberRangeArray(tableCells.length)
  const arrayMaxColumns = createNumberRangeArray(Math.max(...tableCells.map((row) => row.length)))

  const headRow1 = arrayMaxColumns.map((col) => `| #${col + 1} `).join('') + '|'
  const headRow2 = arrayMaxColumns.map((col) => `| -${'-'.repeat((col + 1).toString().length)} `).join('') + '|'
  const body = arrayMaxRows
    .map((row) => {
      return arrayMaxColumns.map((col) => '| ' + tableCells[row][col] + ' ').join('') + '|'
    })
    .join('\n')
  return `${headRow1}\n${headRow2}\n${body}`
}
