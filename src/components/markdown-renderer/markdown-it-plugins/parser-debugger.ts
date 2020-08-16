import MarkdownIt from 'markdown-it/lib'

export const MarkdownItParserDebugger: MarkdownIt.PluginSimple = (md: MarkdownIt) => {
  md.core.ruler.push('test', (state) => {
    console.log(state)
    return true
  })
}
