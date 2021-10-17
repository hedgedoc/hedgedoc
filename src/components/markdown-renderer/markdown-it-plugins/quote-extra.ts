/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type MarkdownIt from 'markdown-it/lib'
import type Token from 'markdown-it/lib/token'
import type { IconName } from '../../common/fork-awesome/types'

export const quoteExtra: (quoteLabel: string, icon: IconName) => MarkdownIt.PluginSimple =
  (quoteLabel: string, icon: IconName) => (md) => {
    md.inline.ruler.push(`extraQuote_${quoteLabel}`, (state) => {
      const quoteExtraTagValues = parseQuoteExtraTag(state.src, state.pos, state.posMax)

      if (!quoteExtraTagValues || quoteExtraTagValues.label !== quoteLabel) {
        return false
      }
      state.pos = quoteExtraTagValues.valueEndIndex + 1

      const tokens: Token[] = []
      state.md.inline.parse(quoteExtraTagValues.value, state.md, state.env, tokens)

      const token = state.push('quote-extra', '', 0)
      token.attrSet('icon', icon)
      token.children = tokens

      return true
    })

    if (md.renderer.rules['quote-extra']) {
      return
    }

    md.renderer.rules['quote-extra'] = (tokens, idx, options: MarkdownIt.Options, env: unknown) => {
      const token = tokens[idx]
      const innerTokens = token.children

      if (!innerTokens) {
        return ''
      }

      const innerHtml = md.renderer.renderInline(innerTokens, options, env)
      return `<span class="quote-extra"><i class="fa fa-${token.attrGet('icon') ?? ''} mx-1"></i>${innerHtml}</span>`
    }
  }

export interface QuoteExtraTagValues {
  labelStartIndex: number
  labelEndIndex: number
  valueStartIndex: number
  valueEndIndex: number
  label: string
  value: string
}

export const parseQuoteExtraTag = (line: string, start: number, maxPos: number): QuoteExtraTagValues | undefined => {
  if (line[start] !== '[') {
    return
  }

  const labelStartIndex = start + 1
  const labelEndIndex = parseLabel(line, labelStartIndex, maxPos)
  if (!labelEndIndex || labelStartIndex === labelEndIndex) {
    return
  }

  const valueStartIndex = labelEndIndex + 1
  const valueEndIndex = parseValue(line, valueStartIndex, maxPos)
  if (!valueEndIndex || valueStartIndex === valueEndIndex) {
    return
  }

  return {
    labelStartIndex,
    labelEndIndex,
    valueStartIndex,
    valueEndIndex,
    label: line.substr(labelStartIndex, labelEndIndex - labelStartIndex),
    value: line.substr(valueStartIndex, valueEndIndex - valueStartIndex)
  }
}

const parseValue = (line: string, start: number, maxPos: number): number | undefined => {
  let level = 1
  for (let pos = start; pos <= maxPos; pos += 1) {
    const currentCharacter = line[pos]
    if (currentCharacter === ']') {
      level -= 1
      if (level === 0) {
        return pos
      }
    } else if (currentCharacter === '[') {
      level += 1
    }
  }
}

const parseLabel = (line: string, start: number, maxPos: number): number | undefined => {
  for (let pos = start; pos <= maxPos; pos += 1) {
    if (line[pos] === '=') {
      return pos
    }
  }
}
