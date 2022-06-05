/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Mock } from 'ts-mockery'
import * as wrapSelectionModule from './formatters/wrap-selection'
import { applyFormatTypeToMarkdownLines } from './apply-format-type-to-markdown-lines'
import type { CursorSelection } from '../../editor/types'
import { FormatType } from '../types'
import * as changeCursorsToWholeLineIfNoToCursorModule from './formatters/utils/change-cursors-to-whole-line-if-no-to-cursor'
import * as prependLinesOfSelectionModule from './formatters/prepend-lines-of-selection'
import * as replaceSelectionModule from './formatters/replace-selection'
import * as addLinkModule from './formatters/add-link'

describe('apply format type to markdown lines', () => {
  Mock.configure('jest')

  const markdownContentMock = 'input'
  const cursorSelectionMock = Mock.of<CursorSelection>()

  const wrapSelectionMock = jest.spyOn(wrapSelectionModule, 'wrapSelection')
  const wrapSelectionMockResponse = Mock.of<[string, CursorSelection]>()

  const changeCursorsToWholeLineIfNoToCursorMock = jest.spyOn(
    changeCursorsToWholeLineIfNoToCursorModule,
    'changeCursorsToWholeLineIfNoToCursor'
  )
  const changeCursorsToWholeLineIfNoToCursorMockResponse = Mock.of<CursorSelection>()

  const prependLinesOfSelectionMock = jest.spyOn(prependLinesOfSelectionModule, 'prependLinesOfSelection')

  const replaceSelectionMock = jest.spyOn(replaceSelectionModule, 'replaceSelection')
  const replaceSelectionMockResponse = Mock.of<[string, CursorSelection]>()

  const addLinkMock = jest.spyOn(addLinkModule, 'addLink')
  const addLinkMockResponse = Mock.of<[string, CursorSelection]>()

  beforeAll(() => {
    wrapSelectionMock.mockReturnValue(wrapSelectionMockResponse)
    changeCursorsToWholeLineIfNoToCursorMock.mockReturnValue(changeCursorsToWholeLineIfNoToCursorMockResponse)
    prependLinesOfSelectionMock.mockImplementation(
      (
        markdownContent: string,
        selection: CursorSelection,
        generatePrefix: (line: string, lineIndexInBlock: number) => string
      ): [string, CursorSelection] => {
        return [generatePrefix(markdownContent, 0) + markdownContent, selection]
      }
    )
    replaceSelectionMock.mockReturnValue(replaceSelectionMockResponse)
    addLinkMock.mockReturnValue(addLinkMockResponse)
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  it('can process the format type bold', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentMock, cursorSelectionMock, FormatType.BOLD)
    expect(result).toBe(wrapSelectionMockResponse)
    expect(wrapSelectionMock).toBeCalledWith(markdownContentMock, cursorSelectionMock, '**', '**')
  })

  it('can process the format type italic', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentMock, cursorSelectionMock, FormatType.ITALIC)
    expect(result).toBe(wrapSelectionMockResponse)
    expect(wrapSelectionMock).toBeCalledWith(markdownContentMock, cursorSelectionMock, '*', '*')
  })

  it('can process the format type strikethrough', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentMock, cursorSelectionMock, FormatType.STRIKETHROUGH)
    expect(result).toBe(wrapSelectionMockResponse)
    expect(wrapSelectionMock).toBeCalledWith(markdownContentMock, cursorSelectionMock, '~~', '~~')
  })

  it('can process the format type underline', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentMock, cursorSelectionMock, FormatType.UNDERLINE)
    expect(result).toBe(wrapSelectionMockResponse)
    expect(wrapSelectionMock).toBeCalledWith(markdownContentMock, cursorSelectionMock, '++', '++')
  })

  it('can process the format type subscript', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentMock, cursorSelectionMock, FormatType.SUBSCRIPT)
    expect(result).toBe(wrapSelectionMockResponse)
    expect(wrapSelectionMock).toBeCalledWith(markdownContentMock, cursorSelectionMock, '~', '~')
  })

  it('can process the format type superscript', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentMock, cursorSelectionMock, FormatType.SUPERSCRIPT)
    expect(result).toBe(wrapSelectionMockResponse)
    expect(wrapSelectionMock).toBeCalledWith(markdownContentMock, cursorSelectionMock, '^', '^')
  })

  it('can process the format type highlight', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentMock, cursorSelectionMock, FormatType.HIGHLIGHT)
    expect(result).toBe(wrapSelectionMockResponse)
    expect(wrapSelectionMock).toBeCalledWith(markdownContentMock, cursorSelectionMock, '==', '==')
  })

  it('can process the format type code fence', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentMock, cursorSelectionMock, FormatType.CODE_FENCE)
    expect(result).toBe(wrapSelectionMockResponse)
    expect(changeCursorsToWholeLineIfNoToCursorMock).toBeCalledWith(markdownContentMock, cursorSelectionMock)
    expect(wrapSelectionMock).toBeCalledWith(
      markdownContentMock,
      changeCursorsToWholeLineIfNoToCursorMockResponse,
      '```\n',
      '\n```'
    )
  })

  it('can process the format type unordered list', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentMock, cursorSelectionMock, FormatType.UNORDERED_LIST)
    expect(result).toEqual(['- input', cursorSelectionMock])
    expect(prependLinesOfSelectionMock).toBeCalledWith(markdownContentMock, cursorSelectionMock, expect.anything())
  })

  it('can process the format type ordered list', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentMock, cursorSelectionMock, FormatType.ORDERED_LIST)
    expect(result).toEqual(['1. input', cursorSelectionMock])
    expect(prependLinesOfSelectionMock).toBeCalledWith(markdownContentMock, cursorSelectionMock, expect.anything())
  })

  it('can process the format type check list', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentMock, cursorSelectionMock, FormatType.CHECK_LIST)
    expect(result).toEqual(['- [ ] input', cursorSelectionMock])
    expect(prependLinesOfSelectionMock).toBeCalledWith(markdownContentMock, cursorSelectionMock, expect.anything())
  })

  it('can process the format type quotes', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentMock, cursorSelectionMock, FormatType.QUOTES)
    expect(result).toEqual(['> input', cursorSelectionMock])
    expect(prependLinesOfSelectionMock).toBeCalledWith(markdownContentMock, cursorSelectionMock, expect.anything())
  })

  it('can process the format type horizontal line with only from cursor', () => {
    const randomCursorPosition = 138743857
    const result = applyFormatTypeToMarkdownLines(
      markdownContentMock,
      { from: randomCursorPosition },
      FormatType.HORIZONTAL_LINE
    )
    expect(result).toEqual(replaceSelectionMockResponse)
    expect(replaceSelectionMock).toBeCalledWith(markdownContentMock, { from: randomCursorPosition }, `\n----`)
  })

  it('can process the format type horizontal line with from and to cursor', () => {
    const fromCursor = Math.random()
    const toCursor = Math.random()

    const result = applyFormatTypeToMarkdownLines(
      markdownContentMock,
      { from: fromCursor, to: toCursor },
      FormatType.HORIZONTAL_LINE
    )
    expect(result).toEqual(replaceSelectionMockResponse)
    expect(replaceSelectionMock).toBeCalledWith(markdownContentMock, { from: toCursor }, `\n----`)
  })

  it('can process the format type comment with only from cursor', () => {
    const fromCursor = Math.random()
    const result = applyFormatTypeToMarkdownLines(markdownContentMock, { from: fromCursor }, FormatType.COMMENT)
    expect(result).toEqual(replaceSelectionMockResponse)
    expect(replaceSelectionMock).toBeCalledWith(markdownContentMock, { from: fromCursor }, `\n> []`)
  })

  it('can process the format type comment with from and to cursor', () => {
    const fromCursor = 0
    const toCursor = 1

    const result = applyFormatTypeToMarkdownLines(
      markdownContentMock,
      { from: fromCursor, to: toCursor },
      FormatType.COMMENT
    )
    expect(result).toEqual(replaceSelectionMockResponse)
    expect(replaceSelectionMock).toBeCalledWith(markdownContentMock, { from: toCursor }, `\n> []`)
  })

  it('can process the format type collapsible block', () => {
    const result = applyFormatTypeToMarkdownLines(
      markdownContentMock,
      cursorSelectionMock,
      FormatType.COLLAPSIBLE_BLOCK
    )
    expect(result).toBe(wrapSelectionMockResponse)
    expect(changeCursorsToWholeLineIfNoToCursorMock).toBeCalledWith(markdownContentMock, cursorSelectionMock)
    expect(wrapSelectionMock).toBeCalledWith(
      markdownContentMock,
      changeCursorsToWholeLineIfNoToCursorMockResponse,
      ':::spoiler Toggle label\n',
      '\n:::'
    )
  })

  it('can process the format type header level with existing level', () => {
    const inputLines = '# text'
    const result = applyFormatTypeToMarkdownLines(inputLines, cursorSelectionMock, FormatType.HEADER_LEVEL)
    expect(result).toEqual(['## text', cursorSelectionMock])
    expect(prependLinesOfSelectionMock).toBeCalledWith(inputLines, cursorSelectionMock, expect.anything())
  })

  it('can process the format type link', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentMock, cursorSelectionMock, FormatType.LINK)
    expect(result).toEqual(addLinkMockResponse)
    expect(addLinkMock).toBeCalledWith(markdownContentMock, cursorSelectionMock)
  })

  it('can process the format type image link', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentMock, cursorSelectionMock, FormatType.IMAGE_LINK)
    expect(result).toEqual(addLinkMockResponse)
    expect(addLinkMock).toBeCalledWith(markdownContentMock, cursorSelectionMock, '!')
  })

  it('can process an unknown format type ', () => {
    const result = applyFormatTypeToMarkdownLines(markdownContentMock, cursorSelectionMock, 'UNKNOWN' as FormatType)
    expect(result).toEqual([markdownContentMock, cursorSelectionMock])
  })
})
