import { Editor, Hint, Hints, Pos } from 'codemirror'
import { findWordAtCursor, Hinter, search } from './index'

const allowedChars = /#/
const wordRegExp = /^(\s{0,3})(#{1,6})$/
const allSupportedHeaders = ['# h1', '## h2', '### h3', '#### h4', '##### h5', '###### h6', '###### tags: `example`']
const allSupportedHeadersTextToInsert = ['# ', '## ', '### ', '#### ', '##### ', '###### ', '###### tags: `example`']

const headerHint = (editor: Editor): Promise< Hints| null > => {
  return new Promise((resolve) => {
    const searchTerm = findWordAtCursor(editor, allowedChars)
    const searchResult = wordRegExp.exec(searchTerm.text)
    if (searchResult === null) {
      resolve(null)
      return
    }
    const term = searchResult[0]
    if (!term) {
      resolve(null)
      return
    }
    const suggestions = search(term, allSupportedHeaders)
    const cursor = editor.getCursor()
    if (!suggestions) {
      resolve(null)
    } else {
      resolve({
        list: suggestions.map((suggestion, index): Hint => ({
          text: allSupportedHeadersTextToInsert[index],
          displayText: suggestion
        })),
        from: Pos(cursor.line, searchTerm.start),
        to: Pos(cursor.line, searchTerm.end)
      })
    }
  })
}

export const HeaderHinter: Hinter = {
  allowedChars,
  wordRegExp,
  hint: headerHint
}
