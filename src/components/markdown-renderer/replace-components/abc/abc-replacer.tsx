import { DomElement } from 'domhandler'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import { AbcFrame } from './abc-frame'

export class AbcReplacer implements ComponentReplacer {
  getReplacement (codeNode: DomElement, index: number): React.ReactElement | undefined {
    if (codeNode.name !== 'code' || !codeNode.attribs || !codeNode.attribs['data-highlight-language'] || codeNode.attribs['data-highlight-language'] !== 'abc' || !codeNode.children || !codeNode.children[0]) {
      return
    }

    const code = codeNode.children[0].data as string

    return <AbcFrame key={'index'} code={code}/>
  }
}
