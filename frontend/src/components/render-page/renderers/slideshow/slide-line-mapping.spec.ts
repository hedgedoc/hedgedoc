/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { findSlideForLine } from './slide-line-mapping'

describe('findSlideForLine', () => {
  const markdownContentLines = [
    '# Slide 1',
    '',
    '---',
    '# Slide 2',
    '----',
    '# Slide 2.1',
    '----',
    '# Slide 2.2',
    '---',
    '# Slide 3'
  ]

  it('returns the first slide for the first line', () => {
    expect(findSlideForLine(markdownContentLines, 1)).toEqual({ indexHorizontal: 0, indexVertical: 0 })
  })

  it('returns the next horizontal slide after a horizontal separator', () => {
    expect(findSlideForLine(markdownContentLines, 4)).toEqual({ indexHorizontal: 1, indexVertical: 0 })
  })

  it('returns the next vertical slide after a vertical separator', () => {
    expect(findSlideForLine(markdownContentLines, 6)).toEqual({ indexHorizontal: 1, indexVertical: 1 })
  })

  it('resets the vertical slide index after a horizontal separator', () => {
    expect(findSlideForLine(markdownContentLines, 10)).toEqual({ indexHorizontal: 2, indexVertical: 0 })
  })

  it('returns the first slide for frontmatter lines before the rendered content', () => {
    expect(findSlideForLine(markdownContentLines, -1)).toEqual({ indexHorizontal: 0, indexVertical: 0 })
  })
})
