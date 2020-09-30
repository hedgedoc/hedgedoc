import { Editor, Hint, Hints, Pos } from 'codemirror'
import { findWordAtCursor, Hinter } from './index'

const wordRegExp = /^:::((\w|-|_|\+)*)$/
const allSupportedConatiner = ['success', 'info', 'warning', 'danger']

const containerHint = (editor: Editor): Promise< Hints| null > => {
  return new Promise((resolve) => {
    const searchTerm = findWordAtCursor(editor)
    const searchResult = wordRegExp.exec(searchTerm.text)
    if (searchResult === null) {
      resolve(null)
      return
    }
    const suggestions = allSupportedConatiner
    const cursor = editor.getCursor()
    if (!suggestions) {
      resolve(null)
    } else {
      resolve({
        list: suggestions.map((suggestion: string): Hint => ({
          text: ':::' + suggestion + '\n\n:::\n',
          displayText: suggestion
        })),
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
