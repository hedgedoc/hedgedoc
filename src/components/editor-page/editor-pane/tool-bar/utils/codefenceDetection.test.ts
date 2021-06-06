/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Mock } from 'ts-mockery'
import { Editor } from 'codemirror'
import { isCursorInCodefence } from './codefenceDetection'

Mock.configure('jest')

const mockEditor = (content: string, line: number) => {
  const contentLines = content.split('\n')
  return Mock.of<Editor>({
    getCursor() {
      return {
        line: line,
        ch: 0
      }
    },
    getDoc() {
      return {
        getLine(ln: number) {
          return contentLines[ln] ?? ''
        }
      }
    }
  })
}

describe('Check whether cursor is in codefence', () => {
  it('returns false for empty document', () => {
    const editor = mockEditor('', 0)
    expect(isCursorInCodefence(editor)).toBe(false)
  })

  it('returns true with one open codefence directly above', () => {
    const editor = mockEditor('```\n', 1)
    expect(isCursorInCodefence(editor)).toBe(true)
  })

  it('returns true with one open codefence and empty lines above', () => {
    const editor = mockEditor('```\n\n\n', 3)
    expect(isCursorInCodefence(editor)).toBe(true)
  })

  it('returns false with one completed codefence above', () => {
    const editor = mockEditor('```\n\n```\n', 3)
    expect(isCursorInCodefence(editor)).toBe(false)
  })

  it('returns true with one completed and one open codefence above', () => {
    const editor = mockEditor('```\n\n```\n\n```\n\n', 6)
    expect(isCursorInCodefence(editor)).toBe(true)
  })
})
