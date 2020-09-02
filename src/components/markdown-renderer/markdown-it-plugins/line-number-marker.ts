import MarkdownIt from 'markdown-it/lib'
import Token from 'markdown-it/lib/token'

export interface LineMarkers {
  startLine: number
  endLine: number
}

export interface LineNumberMarkerOptions {
  postLineMarkers: (lineMarkers: LineMarkers[]) => void
}

/**
 * This plugin adds markers to the dom, that are used to map line numbers to dom elements.
 * It also provides a list of line numbers for the top level dom elements.
 */
export const lineNumberMarker: () => MarkdownIt.PluginWithOptions<LineNumberMarkerOptions> = () => {
  return (md: MarkdownIt, options) => {
    // add codimd_linemarker token before each opening or self-closing level-0 tag
    md.core.ruler.push('line_number_marker', (state) => {
      const lineMarkers: LineMarkers[] = []
      tagTokens(state.tokens, lineMarkers)
      if (options?.postLineMarkers) {
        options.postLineMarkers(lineMarkers)
      }
      return true
    })

    md.renderer.rules.codimd_linemarker = (tokens: Token[], index: number): string => {
      const startLineNumber = tokens[index].attrGet('data-start-line')
      const endLineNumber = tokens[index].attrGet('data-end-line')

      if (!startLineNumber || !endLineNumber) {
        // don't render broken linemarkers without a linenumber
        return ''
      }
      // noinspection CheckTagEmptyBody
      return `<codimd-linemarker data-start-line='${startLineNumber}' data-end-line='${endLineNumber}'></codimd-linemarker>`
    }

    const insertNewLineMarker = (startLineNumber: number, endLineNumber: number, tokenPosition: number, level: number, tokens: Token[]) => {
      const startToken = new Token('codimd_linemarker', 'codimd-linemarker', 0)
      startToken.level = level
      startToken.attrPush(['data-start-line', `${startLineNumber}`])
      startToken.attrPush(['data-end-line', `${endLineNumber}`])
      tokens.splice(tokenPosition, 0, startToken)
    }

    const tagTokens = (tokens: Token[], lineMarkers: LineMarkers[]) => {
      for (let tokenPosition = 0; tokenPosition < tokens.length; tokenPosition++) {
        const token = tokens[tokenPosition]
        if (token.hidden) {
          continue
        }

        if (!token.map) {
          continue
        }

        const startLineNumber = token.map[0] + 1
        const endLineNumber = token.map[1] + 1

        if (token.level === 0) {
          lineMarkers.push({ startLine: startLineNumber, endLine: endLineNumber })
        }

        insertNewLineMarker(startLineNumber, endLineNumber, tokenPosition, token.level, tokens)
        tokenPosition += 1

        if (token.children) {
          tagTokens(token.children, lineMarkers)
        }
      }
    }
  }
}
