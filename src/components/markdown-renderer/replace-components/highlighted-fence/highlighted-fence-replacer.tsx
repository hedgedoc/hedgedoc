import { DomElement } from 'domhandler'
import React from 'react'
import { HighlightedCode } from './highlighted-code/highlighted-code'
import { ComponentReplacer } from '../ComponentReplacer'

export class HighlightedCodeReplacer implements ComponentReplacer {
  private lastLineNumber = 0;

  getReplacement (codeNode: DomElement, index: number): React.ReactElement | undefined {
    if (codeNode.name !== 'code' || !codeNode.attribs || !codeNode.attribs['data-highlight-language'] || !codeNode.children || !codeNode.children[0]) {
      return
    }

    const language = codeNode.attribs['data-highlight-language']
    const showLineNumbers = codeNode.attribs['data-show-line-numbers'] !== undefined
    const startLineNumberAttribute = codeNode.attribs['data-start-line-number']

    const startLineNumber = startLineNumberAttribute === '+' ? this.lastLineNumber : (parseInt(startLineNumberAttribute) || 1)
    const wrapLines = codeNode.attribs['data-wrap-lines'] !== undefined
    const code = codeNode.children[0].data as string

    if (showLineNumbers) {
      this.lastLineNumber = startLineNumber + code.split('\n')
        .filter(line => !!line).length
    }

    return <HighlightedCode key={index} language={language} startLineNumber={showLineNumbers ? startLineNumber : undefined} wrapLines={wrapLines} code={code}/>
  }
}
