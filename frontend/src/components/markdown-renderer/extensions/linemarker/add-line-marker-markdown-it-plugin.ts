/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { LinemarkerMarkdownExtension } from './linemarker-markdown-extension'
import type MarkdownIt from 'markdown-it/lib'
import Token from 'markdown-it/lib/token'

export interface LineMarkers {
  startLine: number
  endLine: number
}

const insertNewLineMarker = (
  startLineNumber: number,
  endLineNumber: number,
  tokenPosition: number,
  level: number,
  tokens: Token[]
) => {
  const startToken = new Token('app_linemarker', LinemarkerMarkdownExtension.tagName, 0)
  startToken.level = level
  startToken.attrPush(['data-start-line', `${startLineNumber}`])
  startToken.attrPush(['data-end-line', `${endLineNumber}`])
  tokens.splice(tokenPosition, 0, startToken)
}

const tagTokens = (tokens: Token[], lineMarkers: LineMarkers[]) => {
  for (let tokenPosition = 0; tokenPosition < tokens.length; tokenPosition++) {
    const token = tokens[tokenPosition]
    if (token.hidden || !token.map) {
      continue
    }

    const startLineNumber = token.map[0] + 1
    const endLineNumber = token.map[1] + 1

    if (token.level === 0) {
      lineMarkers.push({ startLine: startLineNumber, endLine: endLineNumber })
      insertNewLineMarker(startLineNumber, endLineNumber, tokenPosition, token.level, tokens)
      tokenPosition += 1
    }

    if (token.children) {
      tagTokens(token.children, lineMarkers)
    }
  }
}

/**
 * This plugin adds markers to the dom, that are used to map line numbers to dom elements.
 * It also provides a list of line numbers for the top level dom elements.
 */
export const addLineMarkerMarkdownItPlugin: (
  markdownIt: MarkdownIt,
  onLineMarkerChange?: (lineMarkers: LineMarkers[]) => void
) => void = (md, onLineMarkerChange) => {
  md.core.ruler.push('line_number_marker', (state) => {
    const lineMarkers: LineMarkers[] = []
    tagTokens(state.tokens, lineMarkers)
    if (onLineMarkerChange) {
      onLineMarkerChange(lineMarkers)
    }
    return true
  })

  md.renderer.rules.app_linemarker = (tokens: Token[], index: number): string => {
    const startLineNumber = tokens[index].attrGet('data-start-line')
    const endLineNumber = tokens[index].attrGet('data-end-line')

    return startLineNumber && endLineNumber
      ? `<${LinemarkerMarkdownExtension.tagName} data-start-line='${startLineNumber}' data-end-line='${endLineNumber}'></${LinemarkerMarkdownExtension.tagName}>`
      : ''
  }
}
