/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { diffArrays } from 'diff'
import type { TextDifferenceResult } from './html-react-transformer'
import type { LineKeys } from '../types'

export const calculateNewLineNumberMapping = (
  newMarkdownLines: string[],
  oldLineKeys: LineKeys[],
  lastUsedLineId: number
): TextDifferenceResult => {
  const lineDifferences = diffArrays<string, LineKeys>(newMarkdownLines, oldLineKeys, {
    comparator: (left: string | LineKeys, right: string | LineKeys) => {
      const leftLine = (left as LineKeys).line ?? (left as string)
      const rightLine = (right as LineKeys).line ?? (right as string)
      return leftLine === rightLine
    }
  })

  const newLines: LineKeys[] = []

  lineDifferences
    .filter((change) => change.added === undefined || !change.added)
    .forEach((value) => {
      if (value.removed) {
        ;(value.value as string[]).forEach((line) => {
          lastUsedLineId += 1
          newLines.push({ line: line, id: lastUsedLineId })
        })
      } else {
        ;(value.value as LineKeys[]).forEach((line) => newLines.push(line))
      }
    })

  return { lines: newLines, lastUsedLineId: lastUsedLineId }
}
