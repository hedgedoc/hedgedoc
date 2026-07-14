/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { SlideState } from '../../../markdown-renderer/hooks/use-reveal'

const horizontalSlideSeparator = /^\s*---\s*$/
const verticalSlideSeparator = /^\s*----\s*$/

/**
 * Maps a markdown source line to the reveal.js slide coordinates that contain it.
 *
 * @param markdownContentLines The rendered markdown lines without frontmatter
 * @param lineNumber The 1-based markdown line number without frontmatter
 */
export const findSlideForLine = (markdownContentLines: string[], lineNumber: number): SlideState => {
  let indexHorizontal = 0
  let indexVertical = 0

  for (let lineIndex = 0; lineIndex < Math.max(0, lineNumber - 1); lineIndex++) {
    const line = markdownContentLines[lineIndex]
    if (line === undefined) {
      break
    }

    if (verticalSlideSeparator.test(line)) {
      indexVertical += 1
    } else if (horizontalSlideSeparator.test(line)) {
      indexHorizontal += 1
      indexVertical = 0
    }
  }

  return { indexHorizontal, indexVertical }
}
