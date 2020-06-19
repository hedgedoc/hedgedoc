declare module 'markdown-it-regex' {
  import MarkdownIt from 'markdown-it/lib'
  import { RegexOptions } from './interface'
  const markdownItRegex: MarkdownIt.PluginWithOptions<RegexOptions>
  export = markdownItRegex
}
