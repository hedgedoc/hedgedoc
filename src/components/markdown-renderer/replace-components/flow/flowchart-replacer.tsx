import { DomElement } from 'domhandler'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import { FlowChart } from './flowchart/flowchart'

export class FlowchartReplacer extends ComponentReplacer {
  public getReplacement (codeNode: DomElement, index: number): React.ReactElement | undefined {
    if (codeNode.name !== 'code' || !codeNode.attribs || !codeNode.attribs['data-highlight-language'] || codeNode.attribs['data-highlight-language'] !== 'flow' || !codeNode.children || !codeNode.children[0]) {
      return
    }

    const code = codeNode.children[0].data as string

    return <FlowChart key={`flowchart-${index}`} code={code}/>
  }
}
