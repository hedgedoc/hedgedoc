/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { LineMarkerPosition } from '../../markdown-renderer/markdown-extension/linemarker/types'

export const findLineMarks = (
  lineMarks: LineMarkerPosition[],
  lineNumber: number
): { lastMarkBefore: LineMarkerPosition | undefined; firstMarkAfter: LineMarkerPosition | undefined } => {
  let lastMarkBefore
  let firstMarkAfter
  for (let i = 0; i < lineMarks.length; i++) {
    const currentMark = lineMarks[i]
    if (!currentMark) {
      continue
    }

    if (currentMark.line <= lineNumber) {
      lastMarkBefore = currentMark
    }
    if (currentMark.line > lineNumber) {
      firstMarkAfter = currentMark
    }
    if (!!firstMarkAfter && !!lastMarkBefore) {
      break
    }
  }
  return {
    lastMarkBefore,
    firstMarkAfter
  }
}
