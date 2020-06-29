declare module 'markdown-it-toc-done-right' {
    import MarkdownIt from 'markdown-it/lib'
    import { TocOptions } from './interface'
    const markdownItTocDoneRight: MarkdownIt.PluginWithOptions<TocOptions>
    export = markdownItTocDoneRight
  }
