import { Editor, Hint, Hints, Pos } from 'codemirror'
import { Data, EmojiData, NimbleEmojiIndex } from 'emoji-mart'
import data from 'emoji-mart/data/twitter.json'
import { getEmojiIcon, getEmojiShortCode } from '../../../../utils/emoji'
import { customEmojis } from '../tool-bar/emoji-picker/emoji-picker'

interface findWordAtCursorResponse {
  start: number,
  end: number,
  text: string
}

const allowedCharsInEmojiCodeRegex = /(:|\w|-|_|\+)/
const emojiIndex = new NimbleEmojiIndex(data as unknown as Data)

export const emojiWordRegex = /^:((\w|-|_|\+)+)$/

export const findWordAtCursor = (editor: Editor): findWordAtCursorResponse => {
  const cursor = editor.getCursor()
  const line = editor.getLine(cursor.line)
  let start = cursor.ch
  let end = cursor.ch
  while (start && allowedCharsInEmojiCodeRegex.test(line.charAt(start - 1))) {
    --start
  }
  while (end < line.length && allowedCharsInEmojiCodeRegex.test(line.charAt(end))) {
    ++end
  }

  return {
    text: line.slice(start, end).toLowerCase(),
    start: start,
    end: end
  }
}

export const emojiHints = (editor: Editor): Promise< Hints| null > => {
  return new Promise((resolve) => {
    const searchTerm = findWordAtCursor(editor)
    const searchResult = emojiWordRegex.exec(searchTerm.text)
    if (searchResult === null) {
      resolve(null)
      return
    }
    const term = searchResult[1]
    if (!term) {
      resolve(null)
      return
    }
    const search = emojiIndex.search(term, {
      emojisToShowFilter: () => true,
      maxResults: 5,
      include: [],
      exclude: [],
      custom: customEmojis as EmojiData[]
    })
    const cursor = editor.getCursor()
    if (!search) {
      resolve(null)
    } else {
      resolve({
        list: search.map((emojiData: EmojiData): Hint => ({
          text: getEmojiShortCode(emojiData),
          render: (parent: HTMLLIElement) => {
            const wrapper = document.createElement('div')
            wrapper.innerHTML = `${getEmojiIcon(emojiData)}   ${getEmojiShortCode(emojiData)}`
            parent.appendChild(wrapper)
          }
        })),
        from: Pos(cursor.line, searchTerm.start),
        to: Pos(cursor.line, searchTerm.end)
      })
    }
  })
}
