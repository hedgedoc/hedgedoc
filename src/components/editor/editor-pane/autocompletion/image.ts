import { Editor, Hint, Hints, Pos } from 'codemirror'
import { findWordAtCursor, Hinter } from './index'

const allowedChars = /[![\]\w]/
const wordRegExp = /^(!(\[.*])?)$/
const allSupportedImages = [
  '![image alt](https:// "title")',
  '![image alt](https:// "title" =WidthxHeight)',
  '![image alt][reference]'
]

const imageHint = (editor: Editor): Promise< Hints| null > => {
  return new Promise((resolve) => {
    const searchTerm = findWordAtCursor(editor, allowedChars)
    const searchResult = wordRegExp.exec(searchTerm.text)
    if (searchResult === null) {
      resolve(null)
      return
    }
    const suggestions = allSupportedImages
    const cursor = editor.getCursor()
    if (!suggestions) {
      resolve(null)
    } else {
      resolve({
        list: suggestions.map((suggestion: string): Hint => ({
          text: suggestion
        })),
        from: Pos(cursor.line, searchTerm.start),
        to: Pos(cursor.line, searchTerm.end + 1)
      })
    }
  })
}

export const ImageHinter: Hinter = {
  allowedChars,
  wordRegExp,
  hint: imageHint
}
