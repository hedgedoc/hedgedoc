/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Checks if the given cursor position is in a code fence.
 *
 * @param markdownContent The markdown content whose content should be checked
 * @param cursorPosition The cursor position that may or may not be in a code fence
 * @return {@link true} if the given cursor position is in a code fence
 */
export const isCursorInCodeFence = (markdownContent: string, cursorPosition: number): boolean => {
  const lines = markdownContent.slice(0, cursorPosition).split('\n')
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
