/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Editor, Hint, Hints, Pos } from 'codemirror'
import { findWordAtCursor, Hinter, search } from './index'

const wordRegExp = /^```((\w|-|_|\+)*)$/
let allSupportedLanguages: string[] = []

const codeBlockHint = (editor: Editor): Promise< Hints| null > => {
  return import(/* webpackChunkName: "highlight.js" */ '../../../common/hljs/hljs').then((hljs) =>
    new Promise((resolve) => {
      const searchTerm = findWordAtCursor(editor)
      const searchResult = wordRegExp.exec(searchTerm.text)
      if (searchResult === null) {
        resolve(null)
        return
      }
      const term = searchResult[1]
      if (allSupportedLanguages.length === 0) {
        allSupportedLanguages = hljs.default.listLanguages().concat('csv', 'flow', 'html', 'js', 'markmap', 'abc', 'graphviz', 'mermaid', 'vega-lite')
      }
      const suggestions = search(term, allSupportedLanguages)
      const cursor = editor.getCursor()
      if (!suggestions) {
        resolve(null)
      } else {
        resolve({
          list: suggestions.map((suggestion: string): Hint => ({
            text: '```' + suggestion + '\n\n```\n',
            displayText: suggestion
          })),
          from: Pos(cursor.line, searchTerm.start),
          to: Pos(cursor.line, searchTerm.end)
        })
      }
    }))
}

export const CodeBlockHinter: Hinter = {
  wordRegExp,
  hint: codeBlockHint
}
