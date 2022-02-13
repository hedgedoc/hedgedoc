/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getGlobalState } from '../../../../../redux'

/**
 * Checks if the start of the current {@link CursorSelection cursor selection} is in a code fence.
 */
export const isCursorInCodeFence = (): boolean => {
  const noteDetails = getGlobalState().noteDetails
  const lines = noteDetails.markdownContent.plain.slice(0, noteDetails.selection.from).split('\n')
  return countCodeFenceLinesUntilIndex(lines) % 2 === 1
}

/**
 * Counts the lines that start or end a code fence.
 *
 * @param lines The lines that should be inspected
 * @return the counted lines
 */
const countCodeFenceLinesUntilIndex = (lines: string[]): number => {
  return lines.filter((line) => line.startsWith('```')).length
}
