/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FrontmatterExtractionResult } from './types'

const FRONTMATTER_BEGIN_REGEX = /^-{3,}$/
const FRONTMATTER_END_REGEX = /^(?:-{3,}|\.{3,})$/

/**
 * Extracts a frontmatter block from a given multiline string.
 * A valid frontmatter block requires the content to start with a line containing at least three dashes.
 * The block is terminated by a line containing the same amount of dashes or dots as the first line.
 * @param content The multiline string from which the frontmatter should be extracted.
 * @return { frontmatterPresent } false if no frontmatter block could be found, true if a block was found.
 *         { rawFrontmatterText } if a block was found, this property contains the extracted text without the fencing.
 *         { frontmatterLines }   if a block was found, this property contains the number of lines to skip from the
 *                                given multiline string for retrieving the non-frontmatter content.
 */
export const extractFrontmatter = (content: string): FrontmatterExtractionResult => {
  const lines = content.split('\n')
  if (lines.length < 2 || !FRONTMATTER_BEGIN_REGEX.test(lines[0])) {
    return {
      frontmatterPresent: false
    }
  }
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].length === lines[0].length && FRONTMATTER_END_REGEX.test(lines[i])) {
      return {
        frontmatterPresent: true,
        rawFrontmatterText: lines.slice(1, i).join('\n'),
        frontmatterLines: i + 1
      }
    }
  }
  return {
    frontmatterPresent: false
  }
}
