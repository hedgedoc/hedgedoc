import React, { useEffect, useState } from 'react'
import { IconName } from '../../../../common/fork-awesome/fork-awesome-icon'
import { ShowIf } from '../../../../common/show-if/show-if'
import './one-click-embedding.scss'

interface OneClickFrameProps {
  onImageFetch?: () => Promise<string>
  loadingImageUrl: string
  hoverIcon?: IconName
  tooltip?: string
  containerClassName?: string
  previewContainerClassName?: string
}

export const OneClickEmbedding: React.FC<OneClickFrameProps> = ({ previewContainerClassName, containerClassName, onImageFetch, loadingImageUrl, children, tooltip, hoverIcon }) => {
  const [showFrame, setShowFrame] = useState(false)
  const [previewImageLink, setPreviewImageLink] = useState<string>(loadingImageUrl)

  const showChildren = () => {
    setShowFrame(true)
  }

  useEffect(() => {
    if (!onImageFetch) {
      return
    }
    onImageFetch().then((imageLink) => {
      setPreviewImageLink(imageLink)
    }).catch((message) => {
      console.error(message)
    })
  }, [onImageFetch])

  return (
    <span className={ containerClassName }>
      <ShowIf condition={showFrame}>
        {children}
      </ShowIf>
      <ShowIf condition={!showFrame}>
        <span className={`one-click-embedding ${previewContainerClassName || ''}`} onClick={showChildren}>
          <img className={'one-click-embedding-preview'} src={previewImageLink} alt={tooltip || ''} title={tooltip || ''}/>
          <ShowIf condition={!!hoverIcon}>
            <i className={`one-click-embedding-icon fa fa-${hoverIcon as string} fa-5x`}/>
          </ShowIf>
        </span>
      </ShowIf>
    </span>
  )
}
