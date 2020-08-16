import { DomElement } from 'domhandler'
import React from 'react'
import { getAttributesFromCodiMdTag } from '../codi-md-tag-utils'
import { ComponentReplacer, SubNodeConverter } from '../ComponentReplacer'
import { PdfFrame } from './pdf-frame'

export class PdfReplacer implements ComponentReplacer {
  private counterMap: Map<string, number> = new Map<string, number>()

  getReplacement (node: DomElement, index: number, subNodeConverter: SubNodeConverter): React.ReactElement | undefined {
    const attributes = getAttributesFromCodiMdTag(node, 'pdf')
    if (attributes && attributes.url) {
      const pdfUrl = attributes.url
      const count = (this.counterMap.get(pdfUrl) || 0) + 1
      this.counterMap.set(pdfUrl, count)
      return <PdfFrame key={`pdf_${pdfUrl}_${count}`} url={pdfUrl}/>
    }
  }
}
