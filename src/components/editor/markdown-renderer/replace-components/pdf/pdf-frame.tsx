import React, { useState } from 'react'
import { ExternalLink } from '../../../../common/links/external-link'
import { OneClickEmbedding } from '../one-click-frame/one-click-embedding'
import './pdf-frame.scss'

export interface PdfFrameProps {
  url: string
}

export const PdfFrame: React.FC<PdfFrameProps> = ({ url }) => {
  const [activated, setActivated] = useState(false)

  return (
    <OneClickEmbedding containerClassName={`embed-responsive embed-responsive-${activated ? '4by3' : '16by9'}`}
      previewContainerClassName={'embed-responsive-item bg-danger'} hoverIcon={'file-pdf-o'}
      loadingImageUrl={''} onActivate={() => setActivated(true)}>
      <object type={'application/pdf'} data={url} className={'pdf-frame'}>
        <ExternalLink text={url} href={url}/>
      </object>
    </OneClickEmbedding>
  )
}
