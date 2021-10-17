/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Editor, Hint, Hints } from 'codemirror'
import { Pos } from 'codemirror'
import { validAlertLevels } from '../../../markdown-renderer/markdown-it-plugins/alert-container'
import type { Hinter } from './index'
import { findWordAtCursor } from './index'

const wordRegExp = /^:::((?:\w|-|\+)*)$/
const spoilerSuggestion: Hint = {
  text: ':::spoiler Toggle label\nToggled content\n::: \n',
  displayText: 'spoiler'
}
const suggestions = validAlertLevels
  .map(
    (suggestion: string): Hint => ({
      text: ':::' + suggestion + '\n\n::: \n',
      displayText: suggestion
    })
  )
  .concat(spoilerSuggestion)

const containerHint = (editor: Editor): Promise<Hints | null> => {
  return new Promise((resolve) => {
    const searchTerm = findWordAtCursor(editor)
    const searchResult = wordRegExp.exec(searchTerm.text)
    if (searchResult === null) {
      resolve(null)
      return
    }
    const cursor = editor.getCursor()
    if (!suggestions) {
      resolve(null)
    } else {
      resolve({
        list: suggestions.filter((suggestion) => suggestion.displayText?.startsWith(searchResult[1])),
        from: Pos(cursor.line, searchTerm.start),
        to: Pos(cursor.line, searchTerm.end)
      })
    }
  })
}

export const ContainerHinter: Hinter = {
  wordRegExp,
  hint: containerHint
}
