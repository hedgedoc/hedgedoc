declare module 'markdown-it-mathjax' {
  import MarkdownIt from 'markdown-it/lib'
  import { MathJaxOptions } from './interface'
  const markdownItMathJax: (MathJaxOptions) => MarkdownIt.PluginSimple
  export = markdownItMathJax
}
