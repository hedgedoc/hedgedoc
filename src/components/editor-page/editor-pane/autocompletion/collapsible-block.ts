/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Editor, Hint, Hints } from 'codemirror'
import { Pos } from 'codemirror'
import type { Hinter } from './index'
import { findWordAtCursor } from './index'

const wordRegExp = /^(<d(?:e|et|eta|etai|etail|etails)?)$/

const collapsibleBlockHint = (editor: Editor): Promise<Hints | null> => {
  return new Promise((resolve) => {
    const searchTerm = findWordAtCursor(editor)
    const searchResult = wordRegExp.exec(searchTerm.text)
    if (searchResult === null) {
      resolve(null)
      return
    }
    const suggestions = ['<details>\n  <summary>Toggle label</summary>\n  Toggled content\n</details>']
    const cursor = editor.getCursor()
    if (!suggestions) {
      resolve(null)
    } else {
      resolve({
        list: suggestions.map(
          (suggestion: string): Hint => ({
            text: suggestion
          })
        ),
        from: Pos(cursor.line, searchTerm.start),
        to: Pos(cursor.line, searchTerm.end + 1)
      })
    }
  })
}

export const CollapsibleBlockHinter: Hinter = {
  wordRegExp,
  hint: collapsibleBlockHint
}
