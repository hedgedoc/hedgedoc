import { DomElement } from 'domhandler'
import React from 'react'
import { getAttributesFromCodiMdTag } from '../codi-md-tag-utils'
import { ComponentReplacer } from '../ComponentReplacer'
import { PdfFrame } from './pdf-frame'

export class PdfReplacer extends ComponentReplacer {
  private counterMap: Map<string, number> = new Map<string, number>()

  public getReplacement (node: DomElement, index: number): React.ReactElement | undefined {
    const attributes = getAttributesFromCodiMdTag(node, 'pdf')
    if (attributes && attributes.url) {
      const pdfUrl = attributes.url
      const count = (this.counterMap.get(pdfUrl) || 0) + 1
      this.counterMap.set(pdfUrl, count)
      return <PdfFrame key={index} url={pdfUrl}/>
    }
  }
}
