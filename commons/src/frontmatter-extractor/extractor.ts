/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { FrontmatterExtractionResult } from './types.js'

const FRONTMATTER_BEGIN_REGEX = /^-{3,}$/
const FRONTMATTER_END_REGEX = /^(?:-{3,}|\.{3,})$/
const FRONTMATTER_INCOMPLETE_END_REGEX = /^-{1,2}$/

/**
 * Extracts a frontmatter block from a given multiline string.
 * A valid frontmatter block requires the content to start with a line containing at least three dashes.
 * The block is terminated by a line containing the same amount of dashes or dots as the first line.
 * @param lines The lines from which the frontmatter should be extracted.
 * @return { isPresent } false if no frontmatter block could be found, true if a block was found.
 *         { rawFrontmatterText } if a block was found, this property contains the extracted text without the fencing.
 *         { frontmatterLines }   if a block was found, this property contains the number of lines to skip from the
 *                                given multiline string for retrieving the non-frontmatter content.
 */
export const extractFrontmatter = (
  lines: string[],
): FrontmatterExtractionResult | undefined => {
  if (lines.length < 2 || !FRONTMATTER_BEGIN_REGEX.test(lines[0])) {
    return undefined
  }
  for (let i = 1; i < lines.length; i++) {
    if (FRONTMATTER_INCOMPLETE_END_REGEX.test(lines[i])) {
      return {
        rawText: '',
        lineOffset: i + 1,
        incomplete: true,
      }
    }
    if (
      lines[i].length === lines[0].length &&
      FRONTMATTER_END_REGEX.test(lines[i])
    ) {
      return {
        rawText: lines.slice(1, i).join('\n'),
        lineOffset: i + 1,
        incomplete: false,
      }
    }
  }
  return undefined
}
