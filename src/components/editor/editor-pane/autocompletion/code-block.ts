import { Editor, Hint, Hints, Pos } from 'codemirror'
import hljs from 'highlight.js'
import { findWordAtCursor, Hinter, search } from './index'

const allowedChars = /[`\w-_+]/
const wordRegExp = /^```((\w|-|_|\+)*)$/
const allSupportedLanguages = hljs.listLanguages().concat('csv', 'flow', 'html')

const codeBlockHint = (editor: Editor): Promise< Hints| null > => {
  return new Promise((resolve) => {
    const searchTerm = findWordAtCursor(editor, allowedChars)
    const searchResult = wordRegExp.exec(searchTerm.text)
    if (searchResult === null) {
      resolve(null)
      return
    }
    const term = searchResult[1]
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
  })
}

export const CodeBlockHinter: Hinter = {
  allowedChars,
  wordRegExp,
  hint: codeBlockHint
}
