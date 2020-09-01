import { Editor, Hint, Hints, Pos } from 'codemirror'
import { Data, EmojiData, NimbleEmojiIndex } from 'emoji-mart'
import data from 'emoji-mart/data/twitter.json'
import { customEmojis } from '../tool-bar/emoji-picker/emoji-picker'
import { getEmojiIcon, getEmojiShortCode } from '../tool-bar/utils/emojiUtils'
import { findWordAtCursor, Hinter } from './index'

const allowedCharsInEmojiCodeRegex = /[:\w-_+]/
const emojiIndex = new NimbleEmojiIndex(data as unknown as Data)
const emojiWordRegex = /^:([\w-_+]*)$/

const generateEmojiHints = (editor: Editor): Promise< Hints| null > => {
  return new Promise((resolve) => {
    const searchTerm = findWordAtCursor(editor, allowedCharsInEmojiCodeRegex)
    const searchResult = emojiWordRegex.exec(searchTerm.text)
    if (searchResult === null) {
      resolve(null)
      return
    }
    const term = searchResult[1]
    let search: EmojiData[] | null = emojiIndex.search(term, {
      emojisToShowFilter: () => true,
      maxResults: 7,
      include: [],
      exclude: [],
      custom: customEmojis as EmojiData[]
    })
    if (search === null) {
      // set search to the first seven emojis in data
      search = Object.values(emojiIndex.emojis).slice(0, 7)
    }
    const cursor = editor.getCursor()
    if (!search) {
      resolve(null)
    } else {
      resolve({
        list: search.map((emojiData): Hint => ({
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

export const EmojiHinter: Hinter = {
  allowedChars: allowedCharsInEmojiCodeRegex,
  wordRegExp: emojiWordRegex,
  hint: generateEmojiHints
}
