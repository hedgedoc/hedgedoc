import MarkdownIt from 'markdown-it/lib'
import Token from 'markdown-it/lib/token'

export const lineNumberMarker: () => MarkdownIt.PluginSimple = () => {
  const endMarkers: number[] = []

  return (md: MarkdownIt) => {
    // add codimd_linemarker token before each opening or self-closing level-0 tag
    md.core.ruler.push('line_number_marker', (state) => {
      for (let i = 0; i < state.tokens.length; i++) {
        const token = state.tokens[i]
        if (token.level !== 0) {
          continue
        }
        if (token.nesting !== -1) {
          if (!token.map) {
            continue
          }
          const lineNumber = token.map[0] + 1
          if (token.nesting === 1) {
            endMarkers.push(token.map[1] + 1)
          }
          const tokenBefore = state.tokens[i - 1]
          if (tokenBefore === undefined || tokenBefore.type !== 'codimd_linemarker' || tokenBefore.tag !== 'codimd-linemarker' ||
            tokenBefore.attrGet('data-linenumber') !== `${lineNumber}`) {
            const startToken = new Token('codimd_linemarker', 'codimd-linemarker', 0)
            startToken.attrPush(['data-linenumber', `${lineNumber}`])
            state.tokens.splice(i, 0, startToken)
            i += 1
          }
        } else {
          const lineNumber = endMarkers.pop()
          if (lineNumber) {
            const startToken = new Token('codimd_linemarker', 'codimd-linemarker', 0)
            startToken.attrPush(['data-linenumber', `${lineNumber}`])
            state.tokens.splice(i + 1, 0, startToken)
            i += 1
          }
        }
      }
      return true
    })

    // render codimd_linemarker token to <codimd-linemarker></codimd-linemarker>
    md.renderer.rules.codimd_linemarker = (tokens: Token[], index: number): string => {
      const lineNumber = tokens[index].attrGet('data-linenumber')
      if (!lineNumber) {
        // don't render broken linemarkers without a linenumber
        return ''
      }
      // noinspection CheckTagEmptyBody
      return `<codimd-linemarker data-linenumber='${lineNumber}'></codimd-linemarker>`
    }
  }
}
