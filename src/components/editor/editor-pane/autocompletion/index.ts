/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Editor, Hints } from 'codemirror'
import { CodeBlockHinter } from './code-block'
import { CollapsableBlockHinter } from './collapsable-block'
import { ContainerHinter } from './container'
import { EmojiHinter } from './emoji'
import { HeaderHinter } from './header'
import { ImageHinter } from './image'
import { LinkAndExtraTagHinter } from './link-and-extra-tag'
import { PDFHinter } from './pdf'

interface findWordAtCursorResponse {
  start: number,
  end: number,
  text: string
}

export interface Hinter {
  wordRegExp: RegExp,
  hint: (editor: Editor) => Promise< Hints| null >
}

const allowedChars = /[^\s]/

export const findWordAtCursor = (editor: Editor): findWordAtCursorResponse => {
  const cursor = editor.getCursor()
  const line = editor.getLine(cursor.line)
  let start = cursor.ch
  let end = cursor.ch
  while (start && allowedChars.test(line.charAt(start - 1))) {
    --start
  }
  while (end < line.length && allowedChars.test(line.charAt(end))) {
    ++end
  }

  return {
    text: line.slice(start, end).toLowerCase(),
    start: start,
    end: end
  }
}

export const search = (term: string, list: string[]): string[] => {
  const suggestions: string[] = []
  list.forEach(item => {
    if (item.toLowerCase().startsWith(term.toLowerCase())) {
      suggestions.push(item)
    }
  })
  return suggestions.slice(0, 7)
}

export const allHinters: Hinter[] = [
  CodeBlockHinter,
  ContainerHinter,
  EmojiHinter,
  HeaderHinter,
  ImageHinter,
  LinkAndExtraTagHinter,
  PDFHinter,
  CollapsableBlockHinter
]
