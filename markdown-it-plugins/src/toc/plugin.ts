/*
 * SPDX-FileCopyrightText: Original: (c) 2018 Fabio Zendhi Nagao / Modifications: (c) 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: MIT
 */

import { Optional } from '@mrdrogdrog/optional'
import { encode as htmlencode } from 'html-entities'
import MarkdownIt from 'markdown-it'
import StateBlock from 'markdown-it/lib/rules_block/state_block.js'
import Token from 'markdown-it/lib/token.js'
import { TocAst } from './toc-ast.js'
import { renderAstToHtml } from './toc-body-renderer.js'
import { defaultOptions, TocOptions } from './toc-options.js'

class Plugin {
  private readonly tocOptions: TocOptions
  private currentAst?: TocAst
  public readonly START_LEVEL_ATTRIBUTE_NAME = 'startLevel'
  public readonly END_LEVEL_ATTRIBUTE_NAME = 'endLevel'

  private readonly TOC_PLACEHOLDER = /^(?:\[\[toc(?::(\d+):(\d+))?]]|\[toc(?::(\d+):(\d+))?])$/i

  public constructor(md: MarkdownIt, tocOptions?: Partial<TocOptions>) {
    this.tocOptions = {
      ...defaultOptions,
      ...tocOptions
    }
    md.renderer.rules.tocOpen = this.renderTocOpen.bind(this)
    md.renderer.rules.tocClose = this.renderTocClose.bind(this)
    md.renderer.rules.tocBody = this.renderTocBody.bind(this)
    md.core.ruler.push('generateTocAst', (state) => this.generateTocAst(state.tokens))
    md.block.ruler.before('heading', 'toc', this.generateTocToken.bind(this), {
      alt: ['paragraph', 'reference', 'blockquote']
    })
  }

  private generateTocToken(state: StateBlock, startLine: number, _endLine: number, silent: boolean): boolean {
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]

    // use whitespace as a line tokenizer and extract the first token
    // to test against the placeholder anchored pattern, rejecting if false
    const lineFirstToken = state.src.slice(pos, max).split(' ')[0]

    const matches = this.TOC_PLACEHOLDER.exec(lineFirstToken)
    if (matches === null) {
      return false
    }

    if (silent) {
      return true
    }

    state.line = startLine + 1
    const tocOpenToken = state.push('tocOpen', 'nav', 1)
    tocOpenToken.markup = ''
    tocOpenToken.map = [startLine, state.line]

    const tocBodyToken = state.push('tocBody', '', 0)
    tocBodyToken.markup = ''
    tocBodyToken.map = [startLine, state.line]
    tocBodyToken.children = []

    const startLevel = matches[3]
    const endLevel = matches[4]
    if (startLevel !== undefined && endLevel !== undefined) {
      tocBodyToken.attrSet(this.START_LEVEL_ATTRIBUTE_NAME, startLevel)
      tocBodyToken.attrSet(this.END_LEVEL_ATTRIBUTE_NAME, endLevel)
    }

    const tocCloseToken = state.push('tocClose', 'nav', -1)
    tocCloseToken.markup = ''

    return true
  }

  private generateTocAst(tokens: Token[]) {
    this.currentAst = this.headings2ast(tokens)
    this.tocOptions.callback?.(this.currentAst)
  }

  private renderTocOpen(): string {
    const id = this.tocOptions.containerId ? ` id="${htmlencode(this.tocOptions.containerId)}"` : ''
    return `<nav${id} class="${htmlencode(this.tocOptions.containerClass)}">`
  }

  private renderTocClose(): string {
    return '</nav>'
  }

  private createNumberRangeArray(from: number, to: number): number[] {
    return Array.from(Array(to - from + 1).keys()).map((value) => value + from)
  }

  private renderTocBody(tokens: Token[], index: number): string {
    const bodyToken = tokens[index]
    const startLevel = Optional.ofNullable(bodyToken?.attrGet(this.START_LEVEL_ATTRIBUTE_NAME))
      .map(parseInt)
      .filter(isFinite)
      .orElse(null)
    const endLevel = Optional.ofNullable(bodyToken?.attrGet(this.END_LEVEL_ATTRIBUTE_NAME))
      .map(parseInt)
      .filter(isFinite)
      .orElse(null)

    const modifiedTocOptions =
      startLevel !== null && endLevel !== null && startLevel <= endLevel
        ? { ...this.tocOptions, level: this.createNumberRangeArray(startLevel, endLevel) }
        : this.tocOptions

    return this.currentAst ? renderAstToHtml(this.currentAst, modifiedTocOptions) : ''
  }

  private headings2ast(tokens: Token[]): TocAst {
    const ast: TocAst = { level: 0, name: '', children: [] }
    const stack = [ast]

    for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
      const token = tokens[tokenIndex]
      if (token.type !== 'heading_open') {
        continue
      }
      const nextToken = tokens[tokenIndex + 1]
      const key = (nextToken?.children ?? [])
        .filter((token) => this.tocOptions.allowedTokenTypes.includes(token.type))
        .reduce((s, t) => s + t.content, '')

      const node: TocAst = {
        level: parseInt(token.tag.slice(1), 10),
        name: key,
        children: []
      }
      if (node.level > stack[0].level) {
        stack[0].children.push(node)
        stack.unshift(node)
      } else if (node.level === stack[0].level) {
        stack[1].children.push(node)
        stack[0] = node
      } else {
        while (node.level <= stack[0].level) stack.shift()
        stack[0].children.push(node)
        stack.unshift(node)
      }
    }

    return ast
  }
}

/**
 * Creates a new TOC plugin.
 *
 * @param md The markdown-it instance that should be configured
 * @param options The additional options that configure the plugin
 */
export const toc: MarkdownIt.PluginWithOptions<Partial<TocOptions>> = (md, options) => new Plugin(md, options)
