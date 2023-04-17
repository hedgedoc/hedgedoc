/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import HighlightedCode from '../../../components/common/highlighted-code/highlighted-code'
import type { NodeReplacement } from '../../../components/markdown-renderer/replace-components/component-replacer'
import {
  ComponentReplacer,
  DO_NOT_REPLACE,
  ReplacerPriority
} from '../../../components/markdown-renderer/replace-components/component-replacer'
import type { Element } from 'domhandler'
import React from 'react'

/**
 * Detects code blocks and renders them as highlighted code blocks
 */
export class HighlightedCodeReplacer extends ComponentReplacer {
  private lastLineNumber = 0

  private static extractCode(codeNode: Element): string | undefined {
    return codeNode.name === 'code' && !!codeNode.attribs['data-highlight-language'] && !!codeNode.children[0]
      ? ComponentReplacer.extractTextChildContent(codeNode)
      : undefined
  }

  public replace(codeNode: Element): NodeReplacement {
    const code = HighlightedCodeReplacer.extractCode(codeNode)
    if (!code) {
      return DO_NOT_REPLACE
    }

    const language = codeNode.attribs['data-highlight-language']
    const extraData = codeNode.attribs['data-extra']
    const extraInfos = /(=(\d+|\+)?)?(!?)/.exec(extraData)
    const showLineNumbers = extraInfos ? extraInfos[1]?.startsWith('=') : false
    const startLineNumberAttribute = extraInfos?.[2] ?? ''
    const wrapLines = extraInfos?.[3] === '!'
    const startLineNumber =
      startLineNumberAttribute === '+' ? this.lastLineNumber : parseInt(startLineNumberAttribute) || 1

    if (showLineNumbers) {
      this.lastLineNumber = startLineNumber + code.split('\n').filter((line) => !!line).length
    }

    return (
      <HighlightedCode
        language={language}
        startLineNumber={showLineNumbers ? startLineNumber : undefined}
        wrapLines={wrapLines}
        code={code}
      />
    )
  }

  reset() {
    this.lastLineNumber = 0
  }

  getPriority(): ReplacerPriority {
    return ReplacerPriority.LOWER
  }
}
