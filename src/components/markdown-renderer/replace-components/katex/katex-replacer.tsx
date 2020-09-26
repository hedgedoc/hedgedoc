import { DomElement } from 'domhandler'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import './katex.scss'

const getNodeIfKatexBlock = (node: DomElement): (DomElement|undefined) => {
  if (node.name !== 'p' || !node.children || node.children.length === 0) {
    return
  }
  return node.children.find((subnode) => {
    return (subnode.name === 'app-katex' && subnode.attribs?.inline === undefined)
  })
}

const getNodeIfInlineKatex = (node: DomElement): (DomElement|undefined) => {
  return (node.name === 'app-katex' && node.attribs?.inline !== undefined) ? node : undefined
}

const KaTeX = React.lazy(() => import(/* webpackChunkName: "katex" */ '@matejmazur/react-katex'))

export class KatexReplacer extends ComponentReplacer {
  public getReplacement (node: DomElement): React.ReactElement | undefined {
    const katex = getNodeIfKatexBlock(node) || getNodeIfInlineKatex(node)
    if (katex?.children && katex.children[0]) {
      const mathJaxContent = katex.children[0]?.data as string
      const isInline = (katex.attribs?.inline) !== undefined
      return <KaTeX block={!isInline} math={mathJaxContent} errorColor={'#cc0000'}/>
    }
  }
}
