import React from 'react'
import { DomElement } from 'domhandler'
import { ComponentReplacer } from '../../markdown-renderer'
import MathJax from 'react-mathjax'

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

const getElementReplacement: ComponentReplacer = (node, index: number, counterMap) => {
  const mathJax = getNodeIfMathJaxBlock(node) || getNodeIfInlineMathJax(node)
  if (mathJax?.children && mathJax.children[0]) {
    const mathJaxContent = mathJax.children[0]?.data as string
    const isInline = (mathJax.attribs?.inline) !== undefined
    return <MathJax.Node key={index} inline={isInline} formula={mathJaxContent}/>
  }
}

export { getElementReplacement as getMathJaxReplacement }
