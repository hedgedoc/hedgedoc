/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Element } from 'domhandler'
import React from 'react'
import { ComponentReplacer } from '../../replace-components/component-replacer'
import { HighlightedCode } from './highlighted-code'

/**
 * Detects code blocks and renders them as highlighted code blocks
 */
export class HighlightedCodeReplacer extends ComponentReplacer {
  private lastLineNumber = 0

  private extractCode(codeNode: Element): string | undefined {
    return codeNode.name === 'code' && !!codeNode.attribs['data-highlight-language'] && !!codeNode.children[0]
      ? ComponentReplacer.extractTextChildContent(codeNode)
      : undefined
  }

  public replace(codeNode: Element): React.ReactElement | undefined {
    const code = this.extractCode(codeNode)
    if (!code) {
      return
    }

    const language = codeNode.attribs['data-highlight-language']
    const extraData = codeNode.attribs['data-extra']
    const extraInfos = /(=(\d+|\+)?)?(!?)/.exec(extraData)

    let showLineNumbers = false
    let startLineNumberAttribute = ''
    let wrapLines = false

    if (extraInfos) {
      showLineNumbers = extraInfos[1]?.startsWith('=') || false
      startLineNumberAttribute = extraInfos[2]
      wrapLines = extraInfos[3] === '!'
    }

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
}
