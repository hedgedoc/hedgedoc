import { Editor, Hint, Hints, Pos } from 'codemirror'
import Database from 'emoji-picker-element/database'
import { Emoji, EmojiClickEventDetail, NativeEmoji } from 'emoji-picker-element/shared'
import { customEmojis } from '../tool-bar/emoji-picker/emoji-picker'
import { getEmojiIcon, getEmojiShortCode } from '../tool-bar/utils/emojiUtils'
import { findWordAtCursor, Hinter } from './index'

const emojiIndex = new Database({
  customEmoji: customEmojis,
  dataSource: '/static/js/emoji-data.json'
})
const emojiWordRegex = /^:([\w-_+]*)$/

const generateEmojiHints = (editor: Editor): Promise< Hints| null > => {
  return new Promise((resolve) => {
    const searchTerm = findWordAtCursor(editor)
    const searchResult = emojiWordRegex.exec(searchTerm.text)
    if (searchResult === null) {
      resolve(null)
      return
    }
    const term = searchResult[1]
    let suggestionList: Emoji[]
    emojiIndex.getEmojiBySearchQuery(term)
      .then(async (result) => {
        suggestionList = result
        if (result.length === 0) {
          suggestionList = await emojiIndex.getTopFavoriteEmoji(7)
        }
        const cursor = editor.getCursor()
        const skinTone = await emojiIndex.getPreferredSkinTone()
        const emojiEventDetails: EmojiClickEventDetail[] = suggestionList.map((emoji) => {
          return {
            emoji,
            skinTone: skinTone,
            unicode: ((emoji as NativeEmoji).unicode ? (emoji as NativeEmoji).unicode : undefined),
            name: emoji.name
          }
        })
        resolve({
          list: emojiEventDetails.map((emojiData): Hint => ({
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
      })
      .catch(error => {
        console.error(error)
        resolve(null)
      })
  })
}

export const EmojiHinter: Hinter = {
  wordRegExp: emojiWordRegex,
  hint: generateEmojiHints
}
