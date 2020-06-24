import MarkdownIt from 'markdown-it/lib'

const highlightRegex = /^(\w*)(=(\d*|\+))?(!?)$/

export const highlightedCode: MarkdownIt.PluginSimple = (md: MarkdownIt) => {
  md.core.ruler.push('highlighted-code', (state) => {
    state.tokens.forEach(token => {
      if (token.type === 'fence') {
        const highlightInfos = highlightRegex.exec(token.info)
        if (!highlightInfos) {
          return
        }
        if (highlightInfos[1]) {
          token.attrJoin('data-highlight-language', highlightInfos[1])
        }
        if (highlightInfos[2]) {
          token.attrJoin('data-show-line-numbers', '')
        }
        if (highlightInfos[3]) {
          token.attrJoin('data-start-line-number', highlightInfos[3])
        }
        if (highlightInfos[4]) {
          token.attrJoin('data-wrap-lines', '')
        }
      }
    })
    return true
  })
}
