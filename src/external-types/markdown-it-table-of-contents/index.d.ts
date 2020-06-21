declare module 'markdown-it-table-of-contents' {
  import MarkdownIt from 'markdown-it/lib'
  import { TOCOptions } from './interface'
  const markdownItTableOfContents: MarkdownIt.PluginWithOptions<TOCOptions>
  export = markdownItTableOfContents
}
