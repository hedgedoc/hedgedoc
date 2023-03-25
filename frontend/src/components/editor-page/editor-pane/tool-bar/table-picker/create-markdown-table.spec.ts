/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createMarkdownTable } from './create-markdown-table'

describe('create markdown table', () => {
  it('generates a valid table', () => {
    expect(createMarkdownTable(5, 2)).toBe(`|  # 1 |  # 2 |
| ---- | ---- |
|      |      |
|      |      |
|      |      |
|      |      |
|      |      |`)
  })
  it('crashes if called with zero rows', () => {
    expect(() => createMarkdownTable(0, 1)).toThrow()
  })
  it('crashes if called with zero columns', () => {
    expect(() => createMarkdownTable(1, 0)).toThrow()
  })
  it('crashes if called with negative rows', () => {
    expect(() => createMarkdownTable(-1, 1)).toThrow()
  })
  it('crashes if called with negative columns', () => {
    expect(() => createMarkdownTable(1, -1)).toThrow()
  })
})
