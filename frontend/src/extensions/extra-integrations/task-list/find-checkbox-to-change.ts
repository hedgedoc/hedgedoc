/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Optional } from '@mrdrogdrog/optional'

const TASK_REGEX = /^(\s*(?:[-*+]|\d+[.)]) )(\[[ xX]?])/
export const findCheckBoxToChange = (
  originalContent: string,
  lineIndex: number
): Optional<[startIndex: number, endIndex: number]> => {
  const lines = originalContent.split('\n')
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
