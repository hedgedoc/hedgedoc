/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { CursorSelection } from '../../../../editor/types'
import Optional from 'optional-js'

/**
 * If the given cursor selection has no to position then the selection will be changed to cover the whole line of the from cursor.
 *
 * @param markdownContentLines The markdown content lines that are used to calculate the line length for the to cursor
 * @param selection The selection to check
 * @return The corrected selection if no to cursor is present or the unmodified selection otherwise
 * @throws Error if the line, that the from cursor is referring to, doesn't exist.
 */
export const changeCursorsToWholeLineIfNoToCursor = (
  markdownContentLines: string[],
  selection: CursorSelection
): CursorSelection =>
  selection.to !== undefined
    ? selection
    : Optional.ofNullable(markdownContentLines[selection.from.line])
        .map((line) => ({
          from: {
            line: selection.from.line,
            character: 0
          },
          to: {
            line: selection.from.line,
            character: line.length
          }
        }))
        .orElseThrow(() => new Error(`No line with index ${selection.from.line} found.`))
