/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Mock } from 'ts-mockery'
import * as wrapSelectionModule from './formatters/wrap-selection'
import { applyFormatTypeToMarkdownLines } from './apply-format-type-to-markdown-lines'
import type { CursorPosition, CursorSelection } from '../../editor/types'
import { FormatType } from '../types'
import * as changeCursorsToWholeLineIfNoToCursorModule from './formatters/utils/change-cursors-to-whole-line-if-no-to-cursor'
import * as replaceLinesOfSelectionModule from './formatters/replace-lines-of-selection'
import * as replaceSelectionModule from './formatters/replace-selection'
import * as addLinkModule from './formatters/add-link'

describe('apply format type to markdown lines', () => {
  Mock.configure('jest')

  const markdownContentLinesMock = ['input']
  const cursorSelectionMock = Mock.of<CursorSelection>()

  const wrapSelectionMock = jest.spyOn(wrapSelectionModule, 'wrapSelection')
  const wrapSelectionMockResponse = Mock.of<string[]>()

  const changeCursorsToWholeLineIfNoToCursorMock = jest.spyOn(
    changeCursorsToWholeLineIfNoToCursorModule,
    'changeCursorsToWholeLineIfNoToCursor'
  )
  const changeCursorsToWholeLineIfNoToCursorMockResponse = Mock.of<CursorSelection>()

  const replaceLinesOfSelectionMock = jest.spyOn(replaceLinesOfSelectionModule, 'replaceLinesOfSelection')

  const replaceSelectionMock = jest.spyOn(replaceSelectionModule, 'replaceSelection')
  const replaceSelectionMockResponse = Mock.of<string[]>()

  const addLinkMock = jest.spyOn(addLinkModule, 'addLink')
  const addLinkMockResponse = Mock.of<string[]>()

  beforeAll(() => {
    wrapSelectionMock.mockReturnValue(wrapSelectionMockResponse)
    changeCursorsToWholeLineIfNoToCursorMock.mockReturnValue(changeCursorsToWholeLineIfNoToCursorMockResponse)
    replaceLinesOfSelectionMock.mockImplementation(
      (
        lines: string[],
        selection: CursorSelection,
        replacer: (line: string, lineIndex: number) => string
      ): string[] => {
        return lines.map(replacer)
      }
    )
    replaceSelectionMock.mockReturnValue(replaceSelectionMockResponse)
    addLinkMock.mockReturnValue(addLinkMockResponse)
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  it('can process the format type bold', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentLinesMock, cursorSelectionMock, FormatType.BOLD)
    expect(result).toBe(wrapSelectionMockResponse)
    expect(wrapSelectionMock).toBeCalledWith(markdownContentLinesMock, cursorSelectionMock, '**', '**')
  })

  it('can process the format type italic', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentLinesMock, cursorSelectionMock, FormatType.ITALIC)
    expect(result).toBe(wrapSelectionMockResponse)
    expect(wrapSelectionMock).toBeCalledWith(markdownContentLinesMock, cursorSelectionMock, '*', '*')
  })

  it('can process the format type strikethrough', () => {
    const result = applyFormatTypeToMarkdownLines(
      markdownContentLinesMock,
      cursorSelectionMock,
      FormatType.STRIKETHROUGH
    )
    expect(result).toBe(wrapSelectionMockResponse)
    expect(wrapSelectionMock).toBeCalledWith(markdownContentLinesMock, cursorSelectionMock, '~~', '~~')
  })

  it('can process the format type underline', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentLinesMock, cursorSelectionMock, FormatType.UNDERLINE)
    expect(result).toBe(wrapSelectionMockResponse)
    expect(wrapSelectionMock).toBeCalledWith(markdownContentLinesMock, cursorSelectionMock, '++', '++')
  })

  it('can process the format type subscript', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentLinesMock, cursorSelectionMock, FormatType.SUBSCRIPT)
    expect(result).toBe(wrapSelectionMockResponse)
    expect(wrapSelectionMock).toBeCalledWith(markdownContentLinesMock, cursorSelectionMock, '~', '~')
  })

  it('can process the format type superscript', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentLinesMock, cursorSelectionMock, FormatType.SUPERSCRIPT)
    expect(result).toBe(wrapSelectionMockResponse)
    expect(wrapSelectionMock).toBeCalledWith(markdownContentLinesMock, cursorSelectionMock, '^', '^')
  })

  it('can process the format type highlight', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentLinesMock, cursorSelectionMock, FormatType.HIGHLIGHT)
    expect(result).toBe(wrapSelectionMockResponse)
    expect(wrapSelectionMock).toBeCalledWith(markdownContentLinesMock, cursorSelectionMock, '==', '==')
  })

  it('can process the format type code fence', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentLinesMock, cursorSelectionMock, FormatType.CODE_FENCE)
    expect(result).toBe(wrapSelectionMockResponse)
    expect(changeCursorsToWholeLineIfNoToCursorMock).toBeCalledWith(markdownContentLinesMock, cursorSelectionMock)
    expect(wrapSelectionMock).toBeCalledWith(
      markdownContentLinesMock,
      changeCursorsToWholeLineIfNoToCursorMockResponse,
      '```\n',
      '\n```'
    )
  })

  it('can process the format type unordered list', () => {
    const result = applyFormatTypeToMarkdownLines(
      markdownContentLinesMock,
      cursorSelectionMock,
      FormatType.UNORDERED_LIST
    )
    expect(result).toEqual(['- input'])
    expect(replaceLinesOfSelectionMock).toBeCalledWith(markdownContentLinesMock, cursorSelectionMock, expect.anything())
  })

  it('can process the format type unordered list', () => {
    const result = applyFormatTypeToMarkdownLines(
      markdownContentLinesMock,
      cursorSelectionMock,
      FormatType.ORDERED_LIST
    )
    expect(result).toEqual(['1. input'])
    expect(replaceLinesOfSelectionMock).toBeCalledWith(markdownContentLinesMock, cursorSelectionMock, expect.anything())
  })

  it('can process the format type check list', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentLinesMock, cursorSelectionMock, FormatType.CHECK_LIST)
    expect(result).toEqual(['- [ ] input'])
    expect(replaceLinesOfSelectionMock).toBeCalledWith(markdownContentLinesMock, cursorSelectionMock, expect.anything())
  })

  it('can process the format type quotes', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentLinesMock, cursorSelectionMock, FormatType.QUOTES)
    expect(result).toEqual(['> input'])
    expect(replaceLinesOfSelectionMock).toBeCalledWith(markdownContentLinesMock, cursorSelectionMock, expect.anything())
  })

  it('can process the format type horizontal line with only from cursor', () => {
    const fromCursor = Mock.of<CursorPosition>()
    const result = applyFormatTypeToMarkdownLines(
      markdownContentLinesMock,
      { from: fromCursor },
      FormatType.HORIZONTAL_LINE
    )
    expect(result).toEqual(replaceSelectionMockResponse)
    expect(replaceSelectionMock).toBeCalledWith(markdownContentLinesMock, { from: fromCursor }, `\n----`)
  })

  it('can process the format type horizontal line with from and to cursor', () => {
    const fromCursor = Mock.of<CursorPosition>()
    const toCursor = Mock.of<CursorPosition>()

    const result = applyFormatTypeToMarkdownLines(
      markdownContentLinesMock,
      { from: fromCursor, to: toCursor },
      FormatType.HORIZONTAL_LINE
    )
    expect(result).toEqual(replaceSelectionMockResponse)
    expect(replaceSelectionMock).toBeCalledWith(markdownContentLinesMock, { from: toCursor }, `\n----`)
  })

  it('can process the format type comment with only from cursor', () => {
    const fromCursor = Mock.of<CursorPosition>()
    const result = applyFormatTypeToMarkdownLines(markdownContentLinesMock, { from: fromCursor }, FormatType.COMMENT)
    expect(result).toEqual(replaceSelectionMockResponse)
    expect(replaceSelectionMock).toBeCalledWith(markdownContentLinesMock, { from: fromCursor }, `\n> []`)
  })

  it('can process the format type comment with from and to cursor', () => {
    const fromCursor = Mock.of<CursorPosition>()
    const toCursor = Mock.of<CursorPosition>()

    const result = applyFormatTypeToMarkdownLines(
      markdownContentLinesMock,
      { from: fromCursor, to: toCursor },
      FormatType.COMMENT
    )
    expect(result).toEqual(replaceSelectionMockResponse)
    expect(replaceSelectionMock).toBeCalledWith(markdownContentLinesMock, { from: toCursor }, `\n> []`)
  })

  it('can process the format type collapsible block', () => {
    const result = applyFormatTypeToMarkdownLines(
      markdownContentLinesMock,
      cursorSelectionMock,
      FormatType.COLLAPSIBLE_BLOCK
    )
    expect(result).toBe(wrapSelectionMockResponse)
    expect(changeCursorsToWholeLineIfNoToCursorMock).toBeCalledWith(markdownContentLinesMock, cursorSelectionMock)
    expect(wrapSelectionMock).toBeCalledWith(
      markdownContentLinesMock,
      changeCursorsToWholeLineIfNoToCursorMockResponse,
      ':::spoiler Toggle label\n',
      '\n:::'
    )
  })

  it('can process the format type header level with existing level', () => {
    const inputLines = ['# text']
    const result = applyFormatTypeToMarkdownLines(inputLines, cursorSelectionMock, FormatType.HEADER_LEVEL)
    expect(result).toEqual(['## text'])
    expect(replaceLinesOfSelectionMock).toBeCalledWith(inputLines, cursorSelectionMock, expect.anything())
  })

  it('can process the format type link', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentLinesMock, cursorSelectionMock, FormatType.LINK)
    expect(result).toEqual(addLinkMockResponse)
    expect(addLinkMock).toBeCalledWith(markdownContentLinesMock, cursorSelectionMock)
  })

  it('can process the format type image link', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentLinesMock, cursorSelectionMock, FormatType.IMAGE_LINK)
    expect(result).toEqual(addLinkMockResponse)
    expect(addLinkMock).toBeCalledWith(markdownContentLinesMock, cursorSelectionMock, '!')
  })

  it('can process an unknown format type ', () => {
    const result = applyFormatTypeToMarkdownLines(
      markdownContentLinesMock,
      cursorSelectionMock,
      'UNKNOWN' as FormatType
    )
    expect(result).toEqual(markdownContentLinesMock)
  })
})
