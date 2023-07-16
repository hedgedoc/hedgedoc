/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { BootstrapIconName } from '../../../components/common/icons/bootstrap-icons'
import { BlockquoteExtraTagMarkdownExtension } from './blockquote-extra-tag-markdown-extension'
import { Optional } from '@mrdrogdrog/optional'
import type MarkdownIt from 'markdown-it/lib'
import type { RuleInline } from 'markdown-it/lib/parser_inline'
import type StateInline from 'markdown-it/lib/rules_inline/state_inline'
import type Token from 'markdown-it/lib/token'

export interface QuoteExtraTagValues {
  labelStartIndex: number
  labelEndIndex: number
  valueStartIndex: number
  valueEndIndex: number
  label: string
  value: string
}

/**
 * Detects the blockquote extra tag syntax `[label=value]` and creates <blockquote-tag> elements.
 */
export class BlockquoteExtraTagMarkdownItPlugin {
  private static readonly BlockquoteExtraTagRuleName = 'blockquote_extra_tag'

  constructor(
    private tagName: string,
    private icon: BootstrapIconName
  ) {}

  /**
   * Registers an inline rule that detects blockquote extra tags and replaces them with blockquote tokens.
   *
   * @param markdownIt The {@link MarkdownIt markdown-it} in which the inline rule should be registered.
   */
  public registerRule(markdownIt: MarkdownIt): void {
    markdownIt.inline.ruler.before('link', `blockquote_extra_tag_${this.tagName}`, this.createInlineRuler())
    BlockquoteExtraTagMarkdownItPlugin.registerRenderer(markdownIt)
  }

  /**
   * Creates a {@link RuleInline markdown-it inline rule} that detects the configured blockquote extra tag.
   *
   * @return The created inline rule
   */
  private createInlineRuler(): RuleInline {
    return (state) =>
      this.parseBlockquoteExtraTag(state.src, state.pos, state.posMax)
        .map((parseResults) => {
          this.createNewBlockquoteExtraTagToken(state, parseResults.label, parseResults.value)
          state.pos = parseResults.valueEndIndex + 1
          return true
        })
        .orElse(false)
  }

  /**
   * Register the markdown-it renderer that translated `blockquote_tag` tokens into HTML
   *
   * @param markdownIt The {@link MarkdownIt markdown-it} in which the render should be registered.
   */
  private static registerRenderer(markdownIt: MarkdownIt): void {
    if (markdownIt.renderer.rules[BlockquoteExtraTagMarkdownItPlugin.BlockquoteExtraTagRuleName]) {
      return
    }
    markdownIt.renderer.rules[BlockquoteExtraTagMarkdownItPlugin.BlockquoteExtraTagRuleName] = (
      tokens,
      idx,
      options: MarkdownIt.Options,
      env: unknown
    ) => {
      const token = tokens[idx]
      const innerTokens = token.children
      const label = token.attrGet('label') ?? ''
      const icon = token.attrGet('icon')
      const iconAttribute = icon === null ? '' : ` data-icon="${icon}"`
      const innerHtml = innerTokens === null ? '' : markdownIt.renderer.renderInline(innerTokens, options, env)
      return `<${BlockquoteExtraTagMarkdownExtension.tagName} data-label='${label}'${iconAttribute}>${innerHtml}</${BlockquoteExtraTagMarkdownExtension.tagName}>`
    }
  }

  /**
   * Creates a new blockquote extra {@link Token token} using the given values.
   *
   * @param state The state in which the token should be inserted
   * @param label The label for the extra token
   * @param value The value for the extra token that will be inline parsed
   * @return The generated token
   */
  private createNewBlockquoteExtraTagToken(state: StateInline, label: string, value: string): Token {
    const token = state.push(BlockquoteExtraTagMarkdownItPlugin.BlockquoteExtraTagRuleName, '', 0)
    token.attrSet('label', label)
    token.attrSet('icon', this.icon)
    token.children = BlockquoteExtraTagMarkdownItPlugin.parseInlineContent(state, value)
    return token
  }

  /**
   * Parses the given content using the markdown-it instance of the given state.
   *
   * @param state The state whose inline parser should be used to parse the given content
   * @param content The content to parse
   * @return The generated tokens
   */
  private static parseInlineContent(state: StateInline, content: string): Token[] {
    const childTokens: Token[] = []
    state.md.inline.parse(content, state.md, state.env, childTokens)
    return childTokens
  }

  /**
   * Parses a blockquote tag. The syntax is [label=value].
   *
   * @param line The line in which the tag should be looked for.
   * @param startIndex The start index for the search.
   * @param dontSearchAfterIndex The maximal position for the search.
   */
  private parseBlockquoteExtraTag(
    line: string,
    startIndex: number,
    dontSearchAfterIndex: number
  ): Optional<QuoteExtraTagValues> {
    if (line[startIndex] !== '[') {
      return Optional.empty()
    }

    const labelStartIndex = startIndex + 1
    const labelEndIndex = BlockquoteExtraTagMarkdownItPlugin.parseLabel(line, labelStartIndex, dontSearchAfterIndex)
    if (!labelEndIndex || labelStartIndex === labelEndIndex) {
      return Optional.empty()
    }

    const label = line.slice(labelStartIndex, labelEndIndex)
    if (label !== this.tagName) {
      return Optional.empty()
    }

    const valueStartIndex = labelEndIndex + 1
    const valueEndIndex = BlockquoteExtraTagMarkdownItPlugin.parseValue(line, valueStartIndex, dontSearchAfterIndex)
    if (!valueEndIndex || valueStartIndex === valueEndIndex) {
      return Optional.empty()
    }
    const value = line.slice(valueStartIndex, valueEndIndex)

    return Optional.of({
      labelStartIndex,
      labelEndIndex,
      valueStartIndex,
      valueEndIndex,
      label,
      value
    })
  }

  /**
   * Parses the value part of a blockquote tag. That is [notthis=THIS] part. It also detects nested [] blocks.
   *
   * @param line The line in which the tag is.
   * @param startIndex The start index of the tag.
   * @param dontSearchAfterIndex The maximal position for the search.
   * @return The value part of the blockquote tag
   */
  private static parseValue(line: string, startIndex: number, dontSearchAfterIndex: number): number | undefined {
    let level = 0
    for (let position = startIndex; position <= dontSearchAfterIndex; position += 1) {
      const currentCharacter = line[position]
      if (currentCharacter === ']') {
        if (level === 0) {
          return position
        }
        level -= 1
      } else if (currentCharacter === '[') {
        level += 1
      }
    }
  }

  /**
   * Parses the label part of a blockquote tag. That is [THIS=notthis] part.
   *
   * @param line The line in which the tag is.
   * @param startIndex The start index of the tag.
   * @param dontSearchAfterIndex The maximal position for the search.
   * @return The label of the blockquote tag.
   */
  private static parseLabel(line: string, startIndex: number, dontSearchAfterIndex: number): number | undefined {
    for (let pos = startIndex; pos <= dontSearchAfterIndex; pos += 1) {
      if (line[pos] === '=') {
        return pos
      }
    }
  }
}
