import { Editor, Hint, Hints, Pos } from 'codemirror'
import { DateTime } from 'luxon'
import { getUser } from '../../../../redux/user/methods'
import { findWordAtCursor, Hinter } from './index'

const wordRegExp = /^(\[(.*])?)$/
const allSupportedLinks = [
  '[link text](https:// "title")',
  '[reference]: https:// "title"',
  '[link text][reference]',
  '[reference]',
  '[^footnote reference]: https://',
  '[^footnote reference]',
  '^[inline footnote]',
  '[TOC]',
  'name',
  'time',
  '[color=#FFFFFF]'

]

const linkAndExtraTagHint = (editor: Editor): Promise< Hints| null > => {
  return new Promise((resolve) => {
    const searchTerm = findWordAtCursor(editor)
    const searchResult = wordRegExp.exec(searchTerm.text)
    if (searchResult === null) {
      resolve(null)
      return
    }
    const suggestions = allSupportedLinks
    const cursor = editor.getCursor()
    if (!suggestions) {
      resolve(null)
    } else {
      resolve({
        list: suggestions.map((suggestion: string): Hint => {
          const user = getUser()
          const userName = user ? user.name : 'Anonymous'
          switch (suggestion) {
            case 'name':
              // Get the user when a completion happens, this prevents to early calls resulting in 'Anonymous'
              return {
                text: `[name=${userName}]`
              }
            case 'time':
              // show the current time when the autocompletion is opened and not when the function is loaded
              return {
                text: `[time=${DateTime.local().toFormat('DDDD T')}]`
              }
            default:
              return {
                text: suggestion + ' ',
                displayText: suggestion
              }
          }
        }),
        from: Pos(cursor.line, searchTerm.start),
        to: Pos(cursor.line, searchTerm.end + 1)
      })
    }
  })
}

export const LinkAndExtraTagHinter: Hinter = {
  wordRegExp,
  hint: linkAndExtraTagHint
}
