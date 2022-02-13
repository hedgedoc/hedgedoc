/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NoteDetails } from '../types/note-details'
import { buildStateFromUpdatedMarkdownContent } from '../build-state-from-updated-markdown-content'
import { replaceSelection } from '../format-selection/formatters/replace-selection'
import { createNumberRangeArray } from '../../../components/common/number-range/number-range'

/**
 * Copies the given {@link NoteDetails note details state} but adds a markdown table with the given table at the end of the cursor selection.
 *
 * @param state The original {@link NoteDetails}
 * @param rows The number of rows of the new table
 * @param columns The number of columns of the new table
 * @return the copied but modified {@link NoteDetails note details state}
 */
export const buildStateFromAddTableAtCursor = (state: NoteDetails, rows: number, columns: number): NoteDetails => {
  const table = createMarkdownTable(rows, columns)
  const [newContent, newSelection] = replaceSelection(
    state.markdownContent.plain,
    { from: state.selection.to ?? state.selection.from },
    table
  )
  const newState = buildStateFromUpdatedMarkdownContent(state, newContent)
  return {
    ...newState,
    selection: newSelection
  }
}

/**
 * Creates a markdown table with the given size.
 *
 * @param rows The number of table rows
 * @param columns The number of table columns
 * @return The created markdown table
 */
const createMarkdownTable = (rows: number, columns: number): string => {
  const rowArray = createNumberRangeArray(rows)
  const colArray = createNumberRangeArray(columns).map((col) => col + 1)
  const head = '|  # ' + colArray.join(' |  # ') + ' |'
  const divider = '| ' + colArray.map(() => '----').join(' | ') + ' |'
  const body = rowArray.map(() => '| ' + colArray.map(() => 'Text').join(' | ') + ' |').join('\n')
  return `\n${head}\n${divider}\n${body}`
}
