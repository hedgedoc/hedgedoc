declare module 'markdown-it-mathjax' {
  import MarkdownIt from 'markdown-it/lib'
  const markdownItMathJax: (MathJaxOptions) => MarkdownIt.PluginSimple
  export = markdownItMathJax
}
