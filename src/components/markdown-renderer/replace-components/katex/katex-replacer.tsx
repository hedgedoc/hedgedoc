import { DomElement } from 'domhandler'
import React from 'react'
import 'katex/dist/katex.min.css'
import TeX from '@matejmazur/react-katex'
import { ComponentReplacer } from '../ComponentReplacer'

const getNodeIfKatexBlock = (node: DomElement): (DomElement|undefined) => {
  if (node.name !== 'p' || !node.children || node.children.length !== 1) {
    return
  }
  const katexNode = node.children[0]
  return (katexNode.name === 'codimd-katex' && katexNode.attribs?.inline === undefined) ? katexNode : undefined
}

const getNodeIfInlineKatex = (node: DomElement): (DomElement|undefined) => {
  return (node.name === 'codimd-katex' && node.attribs?.inline !== undefined) ? node : undefined
}

export class KatexReplacer implements ComponentReplacer {
  getReplacement (node: DomElement, index: number): React.ReactElement | undefined {
    const katex = getNodeIfKatexBlock(node) || getNodeIfInlineKatex(node)
    if (katex?.children && katex.children[0]) {
      const mathJaxContent = katex.children[0]?.data as string
      const isInline = (katex.attribs?.inline) !== undefined
      return <TeX key={index} block={!isInline} math={mathJaxContent} errorColor={'#cc0000'}/>
    }
  }
}
