/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { parseCodeBlockParameters } from './code-block-parameters'
import { Optional } from '@mrdrogdrog/optional'
import type MarkdownIt from 'markdown-it'
import type { RuleCore } from 'markdown-it/lib/parser_core'

const ruleName = 'code-highlighter'

/**
 * Extracts the language name and additional flags from the code fence parameter and sets them as attributes in the token.
 *
 * @param state The current state of the processing {@link MarkdownIt} instance.
 * @see MarkdownIt.RuleCore
 */
const rule: RuleCore = (state): void => {
  state.tokens.forEach((token) => {
    if (token.type === 'fence') {
      const highlightInfos = parseCodeBlockParameters(token.info)
      Optional.ofNullable(highlightInfos.language).ifPresent((language) =>
        token.attrJoin('data-highlight-language', language)
      )
      Optional.ofNullable(highlightInfos.codeFenceParameters).ifPresent((language) =>
        token.attrJoin('data-extra', language)
      )
    }
  })
}

/**
 * Adds the rule to the given {@link MarkdownIt markdown-it instance} if it hasn't been added yet.
 *
 * @param markdownIt The {@link MarkdownIt markdown-it instance} to which the rule should be added
 */
export const codeBlockMarkdownPlugin: MarkdownIt.PluginSimple = (markdownIt: MarkdownIt) => {
  if (markdownIt.core.ruler.getRules(ruleName).length === 0) {
    markdownIt.core.ruler.push(ruleName, rule, { alt: [ruleName] })
  }
}
