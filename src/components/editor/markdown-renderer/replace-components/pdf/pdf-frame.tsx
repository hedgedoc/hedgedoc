import { DomElement } from 'domhandler'
import React, { ReactElement } from 'react'
import { ExternalLink } from '../../../../common/links/external-link'
import { getAttributesFromCodiMdTag } from '../codi-md-tag-utils'
import { OneClickEmbedding } from '../one-click-frame/one-click-embedding'
import './pdf-frame.scss'

const getElementReplacement = (node: DomElement, index:number, counterMap: Map<string, number>): (ReactElement | undefined) => {
  const attributes = getAttributesFromCodiMdTag(node, 'pdf')
  if (attributes && attributes.url) {
    const pdfUrl = attributes.url
    const count = (counterMap.get(pdfUrl) || 0) + 1
    counterMap.set(pdfUrl, count)
    return <PdfFrame key={`pdf_${pdfUrl}_${count}`} url={pdfUrl}/>
  }
}

export interface PdfFrameProps {
  url: string
}

export const PdfFrame: React.FC<PdfFrameProps> = ({ url }) => {
  return (
    <OneClickEmbedding containerClassName={'embed-responsive embed-responsive-4by3'}
      previewContainerClassName={'embed-responsive-item bg-danger'} hoverIcon={'file-pdf-o'}
      loadingImageUrl={''}>
      <object type={'application/pdf'} data={url} className={'pdf-frame'}>
        <ExternalLink text={url} href={url}/>
      </object>
    </OneClickEmbedding>
  )
}

export { getElementReplacement as getPDFReplacement }
