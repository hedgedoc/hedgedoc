import React from 'react'
import { ExternalLink } from '../../../../common/links/external-link'
import { OneClickEmbedding } from '../one-click-frame/one-click-embedding'
import './pdf-frame.scss'

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
