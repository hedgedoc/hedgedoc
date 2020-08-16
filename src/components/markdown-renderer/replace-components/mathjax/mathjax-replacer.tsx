import { DomElement } from 'domhandler'
import React from 'react'
import MathJax from 'react-mathjax'
import { ComponentReplacer, SubNodeConverter } from '../ComponentReplacer'

const getNodeIfMathJaxBlock = (node: DomElement): (DomElement|undefined) => {
  if (node.name !== 'p' || !node.children || node.children.length !== 1) {
    return
  }
  const mathJaxNode = node.children[0]
  return (mathJaxNode.name === 'codimd-mathjax' && mathJaxNode.attribs?.inline === undefined) ? mathJaxNode : undefined
}

const getNodeIfInlineMathJax = (node: DomElement): (DomElement|undefined) => {
  return (node.name === 'codimd-mathjax' && node.attribs?.inline !== undefined) ? node : undefined
}

export class MathjaxReplacer implements ComponentReplacer {
  getReplacement (node: DomElement, index: number, subNodeConverter: SubNodeConverter): React.ReactElement | undefined {
    const mathJax = getNodeIfMathJaxBlock(node) || getNodeIfInlineMathJax(node)
    if (mathJax?.children && mathJax.children[0]) {
      const mathJaxContent = mathJax.children[0]?.data as string
      const isInline = (mathJax.attribs?.inline) !== undefined
      return <MathJax.Node key={index} inline={isInline} formula={mathJaxContent}/>
    }
  }
}
