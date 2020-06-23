import { DomElement } from 'domhandler'
import React, { ReactElement } from 'react'
import { HighlightedCode } from '../../../../common/highlighted-code/highlighted-code'

const getElementReplacement = (codeNode: DomElement, index: number, counterMap: Map<string, number>): (ReactElement | undefined) => {
  if (codeNode.name !== 'code' || !codeNode.attribs || !codeNode.attribs['data-highlight-language'] || !codeNode.children || !codeNode.children[0]) {
    return
  }

  const language = codeNode.attribs['data-highlight-language']
  const showGutter = codeNode.attribs['data-show-gutter'] !== undefined
  const wrapLines = codeNode.attribs['data-wrap-lines'] !== undefined
  return <HighlightedCode key={index} language={language} showGutter={showGutter} wrapLines={wrapLines} code={codeNode.children[0].data as string}/>
}

export { getElementReplacement as getHighlightedFence }
