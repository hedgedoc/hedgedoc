
declare module 'markdown-it-front-matter' {
  import MarkdownIt from 'markdown-it/lib'
  export type FrontMatterPluginOptions = (rawMeta: string) => void
  const markdownItFrontMatter: MarkdownIt.PluginWithOptions<FrontMatterPluginOptions>
  export = markdownItFrontMatter
}
