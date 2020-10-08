import MarkdownIt from 'markdown-it'
import emoji from 'markdown-it-emoji'
import { combinedEmojiData } from './emoji/mapping'

export const twitterEmojis: MarkdownIt.PluginSimple = (markdownIt) => {
  emoji(markdownIt, {
    defs: combinedEmojiData
  })
}
