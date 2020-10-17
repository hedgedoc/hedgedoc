declare module 'markdown-it-emoji/bare' {
  import MarkdownIt from 'markdown-it/lib'
  import { EmojiOptions } from './interface'
  const markdownItEmoji: MarkdownIt.PluginWithOptions<EmojiOptions>
  export = markdownItEmoji
}
