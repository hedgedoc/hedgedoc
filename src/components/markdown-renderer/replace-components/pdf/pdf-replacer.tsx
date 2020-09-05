import { DomElement } from 'domhandler'
import React from 'react'
import { getAttributesFromHedgeDocTag } from '../utils'
import { ComponentReplacer } from '../ComponentReplacer'
import { PdfFrame } from './pdf-frame'

export class PdfReplacer extends ComponentReplacer {
  private counterMap: Map<string, number> = new Map<string, number>()

  public getReplacement (node: DomElement): React.ReactElement | undefined {
    const attributes = getAttributesFromHedgeDocTag(node, 'pdf')
    if (attributes && attributes.url) {
      const pdfUrl = attributes.url
      const count = (this.counterMap.get(pdfUrl) || 0) + 1
      this.counterMap.set(pdfUrl, count)
      return <PdfFrame url={pdfUrl}/>
    }
  }
}
