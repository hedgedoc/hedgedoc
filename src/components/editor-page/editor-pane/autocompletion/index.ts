/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Editor, Hints } from 'codemirror'
import { CodeBlockHinter } from './code-block'
import { CollapsibleBlockHinter } from './collapsible-block'
import { ContainerHinter } from './container'
import { EmojiHinter } from './emoji'
import { HeaderHinter } from './header'
import { ImageHinter } from './image'
import { LinkAndExtraTagHinter } from './link-and-extra-tag'
import { PDFHinter } from './pdf'

interface findWordAtCursorResponse {
  start: number
  end: number
  text: string
}

export interface Hinter {
  wordRegExp: RegExp
  hint: (editor: Editor) => Promise<Hints | null>
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

/**
 * Generates a list (with max 8 entries) of hints for the autocompletion.
 *
 * @param prefix This is the case insensitive prefix that every hint must have
 * @param hintCandidates The list of hint candidates
 */
export const generateHintListByPrefix = (prefix: string, hintCandidates: string[]): string[] => {
  const searchTerm = prefix.toLowerCase()
  return hintCandidates.filter((item) => item.toLowerCase().startsWith(searchTerm)).slice(0, 7)
}

export const allHinters: Hinter[] = [
  CodeBlockHinter,
  ContainerHinter,
  EmojiHinter,
  HeaderHinter,
  ImageHinter,
  LinkAndExtraTagHinter,
  PDFHinter,
  CollapsibleBlockHinter
]
