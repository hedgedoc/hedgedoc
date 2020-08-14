import 'emoji-mart'

declare module 'emoji-mart' {
  export interface SearchOption {
    emojisToShowFilter: (emoji: EmojiData) => boolean
    maxResults: number,
    include: EmojiData[]
    exclude: EmojiData[]
    custom: EmojiData[]
  }

  export class NimbleEmojiIndex {
    search (query: string, options: SearchOption): EmojiData[] | null;
  }
}
