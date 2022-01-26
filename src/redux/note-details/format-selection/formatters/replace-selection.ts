/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { stringSplice } from './utils/string-splice'
import type { CursorPosition, CursorSelection } from '../../../editor/types'

/**
 * Creates a new {@link NoteDetails note state} but replaces the selected text.
 *
 * @param markdownContentLines The lines of the document to modify
 * @param selection If the selection has no to cursor then text will only be inserted.
 *                  If the selection has a to cursor then the selection will be replaced.
 * @param insertText The text that should be inserted
 * @return The modified state
 */
export const replaceSelection = (
  markdownContentLines: string[],
  selection: CursorSelection,
  insertText: string
): string[] => {
  const fromCursor = selection.from
  const toCursor = selection.to ?? selection.from
  const processLine = fromCursor.line === toCursor.line ? processSingleLineSelection : processMultiLineSelection
  return markdownContentLines
    .map((currentLine, currentLineIndex) =>
      processLine(currentLine, currentLineIndex, insertText, fromCursor, toCursor)
    )
    .filter((currentLine, currentLineIndex) => filterLinesBetweenFromAndTo(currentLineIndex, fromCursor, toCursor))
}

/**
 * Filters out every line that is between the from and the to cursor.
 *
 * @param currentLineIndex The index of the current line
 * @param fromCursor The cursor position where the selection starts
 * @param toCursor The cursor position where the selection ends
 * @return {@code true} if the line should be present, {@code false} if it should be omitted.
 */
const filterLinesBetweenFromAndTo = (currentLineIndex: number, fromCursor: CursorPosition, toCursor: CursorPosition) =>
  currentLineIndex <= fromCursor.line || currentLineIndex >= toCursor.line

/**
 * Modifies a line if the selection is only in one line.
 *
 * @param line The current line content
 * @param lineIndex The index of the current line in the document
 * @param insertText The text to insert at the from cursor
 * @param fromCursor The cursor position where the selection starts
 * @param toCursor The cursor position where the selection ends
 * @return the modified line if the current line index matches the line index in the from cursor position, the unmodified line otherwise.
 */
const processSingleLineSelection = (
  line: string,
  lineIndex: number,
  insertText: string,
  fromCursor: CursorPosition,
  toCursor: CursorPosition
) => {
  return lineIndex !== fromCursor.line
    ? line
    : stringSplice(line, fromCursor.character, insertText, toCursor.character - fromCursor.character)
}

/**
 * Modifies the start and the end line of a multi line selection by cutting the tail and head of these lines.
 *
 * @param line The current line content
 * @param lineIndex The index of the current line in the document
 * @param insertText The text to insert at the from cursor
 * @param fromCursor The cursor position where the selection starts
 * @param toCursor The cursor position where the selection ends
 * @return The modified line if it's the line at the from/to cursor position. The lines between will be unmodified because a filter will take care of them.
 */
const processMultiLineSelection = (
  line: string,
  lineIndex: number,
  insertText: string,
  fromCursor: CursorPosition,
  toCursor: CursorPosition
) => {
  if (lineIndex === fromCursor.line) {
    return line.slice(0, fromCursor.character) + insertText
  } else if (lineIndex === toCursor.line) {
    return line.slice(toCursor.character)
  } else {
    return line
  }
}
