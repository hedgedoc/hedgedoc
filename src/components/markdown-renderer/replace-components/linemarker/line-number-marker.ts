/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import MarkdownIt from 'markdown-it/lib'
import Token from 'markdown-it/lib/token'

export interface LineMarkers {
  startLine: number
  endLine: number
}

export type LineNumberMarkerOptions = (lineMarkers: LineMarkers[]) => void;

/**
 * This plugin adds markers to the dom, that are used to map line numbers to dom elements.
 * It also provides a list of line numbers for the top level dom elements.
 */
export const lineNumberMarker: MarkdownIt.PluginWithOptions<LineNumberMarkerOptions> = (md: MarkdownIt, options) => {
  // add app_linemarker token before each opening or self-closing level-0 tag
  md.core.ruler.push('line_number_marker', (state) => {
    const lineMarkers: LineMarkers[] = []
    tagTokens(state.tokens, lineMarkers)
    if (options) {
      options(lineMarkers)
    }
    return true
  })

  md.renderer.rules.app_linemarker = (tokens: Token[], index: number): string => {
    const startLineNumber = tokens[index].attrGet('data-start-line')
    const endLineNumber = tokens[index].attrGet('data-end-line')

    if (!startLineNumber || !endLineNumber) {
      // don't render broken linemarkers without a linenumber
      return ''
    }
    // noinspection CheckTagEmptyBody
    return `<app-linemarker data-start-line='${startLineNumber}' data-end-line='${endLineNumber}'></app-linemarker>`
  }

  const insertNewLineMarker = (startLineNumber: number, endLineNumber: number, tokenPosition: number, level: number, tokens: Token[]) => {
    const startToken = new Token('app_linemarker', 'app-linemarker', 0)
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
