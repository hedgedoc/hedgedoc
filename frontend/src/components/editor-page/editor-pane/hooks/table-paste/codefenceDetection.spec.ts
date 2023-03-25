/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isCursorInCodeFence } from './codefenceDetection'

describe('Check whether cursor is in codefence', () => {
  it('returns false for empty document', () => {
    expect(isCursorInCodeFence('', 0)).toBe(false)
  })

  it('returns true with one open codefence directly above', () => {
    expect(isCursorInCodeFence('```\n', 4)).toBe(true)
  })

  it('returns true with one open codefence and empty lines above', () => {
    expect(isCursorInCodeFence('```\n\n\n', 5)).toBe(true)
  })

  it('returns false with one completed codefence above', () => {
    expect(isCursorInCodeFence('```\n\n```\n', 8)).toBe(false)
  })

  it('returns true with one completed and one open codefence above', () => {
    expect(isCursorInCodeFence('```\n\n```\n\n```\n\n', 13)).toBe(true)
  })
})
