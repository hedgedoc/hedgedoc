declare module 'markdown-it-imsize' {
  import MarkdownIt from 'markdown-it/lib'
  import { ImsizeOptions } from './interface'
  const markdownItImsize: MarkdownIt.PluginWithOptions<ImsizeOptions>
  export = markdownItImsize
}
