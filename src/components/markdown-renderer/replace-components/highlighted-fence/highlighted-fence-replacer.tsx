import { DomElement } from 'domhandler'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import { HighlightedCode } from './highlighted-code/highlighted-code'

export class HighlightedCodeReplacer extends ComponentReplacer {
  private lastLineNumber = 0;

  public getReplacement (codeNode: DomElement, index: number): React.ReactElement | undefined {
    if (codeNode.name !== 'code' || !codeNode.attribs || !codeNode.attribs['data-highlight-language'] || !codeNode.children || !codeNode.children[0]) {
      return
    }

    const language = codeNode.attribs['data-highlight-language']
    const extraData = codeNode.attribs['data-extra']
    const extraInfos = /(=(\d*|\+))?(!?)/.exec(extraData)

    let showLineNumbers = false
    let startLineNumberAttribute = ''
    let wrapLines = false

    if (extraInfos) {
      showLineNumbers = extraInfos[0] !== undefined
      startLineNumberAttribute = extraInfos[1]
      wrapLines = extraInfos[2] !== undefined
    }

    const startLineNumber = startLineNumberAttribute === '+' ? this.lastLineNumber : (parseInt(startLineNumberAttribute) || 1)
    const code = codeNode.children[0].data as string

    if (showLineNumbers) {
      this.lastLineNumber = startLineNumber + code.split('\n')
        .filter(line => !!line).length
    }

    return <HighlightedCode key={index} language={language} startLineNumber={showLineNumbers ? startLineNumber : undefined} wrapLines={wrapLines} code={code}/>
  }
}
