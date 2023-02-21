/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Optional } from '@mrdrogdrog/optional'

const TASK_REGEX = /^(\s*(?:[-*+]|\d+[.)]) )(\[[ xX]?])/

/**
 * Checks if the given markdown content contains a task list checkbox at the given line index.
 *
 * @param markdownContent The content that should be checked
 * @param lineIndex The index of the line that should be checked for a task list checkbox
 * @return An {@link Optional} that contains the start and end index of the found checkbox
 */
export const findCheckBox = (
  markdownContent: string,
  lineIndex: number
): Optional<[startIndex: number, endIndex: number]> => {
  const lines = markdownContent.split('\n')
  const lineStartIndex = findStartIndexOfLine(lines, lineIndex)
  return Optional.ofNullable(TASK_REGEX.exec(lines[lineIndex])).map(([, beforeCheckbox, oldCheckbox]) => [
    lineStartIndex + beforeCheckbox.length,
    lineStartIndex + beforeCheckbox.length + oldCheckbox.length
  ])
}

const findStartIndexOfLine = (lines: string[], wantedLineIndex: number): number => {
  return lines
    .map((value) => value.length)
    .filter((value, index) => index < wantedLineIndex)
    .reduce((state, lineLength) => state + lineLength + 1, 0)
}
